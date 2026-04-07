/**
 * offlineQueue — BC-01 Orchestration de Tournée (US-006 + US-056)
 *
 * File de synchronisation offline pour l'application mobile livreur.
 *
 * Stratégie offline-first :
 *  - Toutes les commandes terrain (ConfirmerLivraison, DeclarerEchec)
 *    sont enregistrées dans cette file avec un commandId UUID v7 unique.
 *  - La file est rejouée en ordre FIFO dès le retour de connexion.
 *  - Chaque commandId garantit l'idempotence côté serveur (409 = déjà traité).
 *  - La clôture de tournée est bloquée tant que la file n'est pas vide.
 *
 * US-056 : Persistance AsyncStorage entre sessions.
 *  - La file est sérialisée dans AsyncStorage à chaque enqueue().
 *  - La file est rechargée depuis AsyncStorage à l'initialisation (initialize()).
 *  - Clé AsyncStorage : 'docupost_offline_queue'
 *  - WatermelonDB (SQLite natif) prévu pour Sprint 4 quand les bindings natifs
 *    sont disponibles (voir journal-developpeur.md — décision US-006).
 *
 * Note : la génération d'UUID v7 utilise un helper maison car
 * la bibliothèque uuid v7 n'est pas encore installée dans le projet.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ASYNC_STORAGE_KEY = 'docupost_offline_queue';

// ─── Types publics ────────────────────────────────────────────────────────────

export enum CommandType {
  CONFIRMER_LIVRAISON = 'CONFIRMER_LIVRAISON',
  DECLARER_ECHEC = 'DECLARER_ECHEC',
}

export interface ConfirmerLivraisonPayload {
  tourneeId: string;
  colisId: string;
  typePreuve: string;
  signatureData?: string;
  nomSignataire?: string;
  nomTiers?: string;
  descriptionLieu?: string;
  photoData?: string;
}

export interface DeclarerEchecPayload {
  tourneeId: string;
  colisId: string;
  motif: string;
  disposition: string;
  note?: string;
}

export type CommandPayload = ConfirmerLivraisonPayload | DeclarerEchecPayload;

export interface OfflineCommand {
  /** UUID v7 — garantit l'idempotence côté serveur */
  commandId: string;
  type: CommandType;
  payload: CommandPayload;
  /** ISO 8601 — détermine l'ordre FIFO */
  createdAt: string;
}

export interface SyncResult {
  success: boolean;
  status?: number;
  /** true si le serveur a répondu 409 (commande déjà traitée) */
  alreadyProcessed?: boolean;
}

export type CommandExecutor = (cmd: OfflineCommand) => Promise<SyncResult>;

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Options d'injection de dépendances pour la file offline.
 * Permet de remplacer AsyncStorage dans les tests.
 */
export interface OfflineQueueOptions {
  /** AsyncStorage à utiliser pour la persistance (injectable pour les tests) */
  storage?: Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;
}

/**
 * Crée une instance isolée de la file offline.
 * Chaque instance est indépendante (permettant les tests unitaires en isolation).
 *
 * US-056 : appeler initialize() après création pour charger la file persistée.
 */
export function createOfflineQueue(options: OfflineQueueOptions = {}) {
  const storage = options.storage ?? AsyncStorage;

  // File FIFO — stockée en mémoire
  const commandsById = new Map<string, OfflineCommand>();
  const commandOrder: string[] = []; // ordre d'insertion FIFO

  /**
   * US-056 — Charge la file depuis AsyncStorage (appeler au démarrage de l'app).
   * Idempotent : les commandes déjà en mémoire ne sont pas dupliquées.
   */
  async function initialize(): Promise<void> {
    try {
      const raw = await storage.getItem(ASYNC_STORAGE_KEY);
      if (!raw) return;
      const commands: OfflineCommand[] = JSON.parse(raw) as OfflineCommand[];
      for (const cmd of commands) {
        if (!commandsById.has(cmd.commandId)) {
          commandsById.set(cmd.commandId, cmd);
          commandOrder.push(cmd.commandId);
        }
      }
    } catch {
      // Lecture AsyncStorage échouée — on continue avec la file vide
    }
  }

  /**
   * US-056 — Sérialise la file courante dans AsyncStorage.
   * Appelé après chaque enqueue() pour garantir la persistance.
   * Silencieux en cas d'erreur.
   */
  async function persist(): Promise<void> {
    try {
      const commands = toArray();
      await storage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(commands));
    } catch {
      // Écriture AsyncStorage échouée — la file reste en mémoire pour la session
    }
  }

  /**
   * Ajoute une commande à la file et la persiste dans AsyncStorage.
   * Idempotent : ignore les commandId déjà présents.
   */
  function enqueue(cmd: OfflineCommand): void {
    if (commandsById.has(cmd.commandId)) {
      // SC3 — doublon ignoré
      return;
    }
    commandsById.set(cmd.commandId, cmd);
    commandOrder.push(cmd.commandId);
    // Persistance asynchrone — on ne bloque pas l'appelant
    void persist();
  }

  /**
   * Rejoue toutes les commandes en ordre FIFO.
   * S'arrête au premier échec réseau (les commandes non jouées restent en file).
   * Les 409 (déjà traités côté serveur) sont considérés comme des succès.
   *
   * US-060 : persist() est appelé après chaque dequeue réussi pour garantir
   * qu'AsyncStorage reflète l'état réel de la file. Ainsi, en cas de redémarrage
   * après une sync partielle, seules les commandes non encore envoyées sont rejouées.
   */
  async function sync(executor: CommandExecutor): Promise<void> {
    // Copie de l'ordre pour itération stable
    const idsToProcess = [...commandOrder];

    for (const commandId of idsToProcess) {
      const cmd = commandsById.get(commandId);
      if (!cmd) continue;

      try {
        const result = await executor(cmd);
        if (result.success || result.alreadyProcessed) {
          // SC3 — 409 traité comme succès
          commandsById.delete(commandId);
          const idx = commandOrder.indexOf(commandId);
          if (idx !== -1) commandOrder.splice(idx, 1);
          // US-060 — persist immédiatement après chaque dequeue réussi
          await persist();
        } else if (result.status === 409) {
          // 409 explicite (alreadyProcessed non renseigné)
          commandsById.delete(commandId);
          const idx = commandOrder.indexOf(commandId);
          if (idx !== -1) commandOrder.splice(idx, 1);
          // US-060 — persist immédiatement après chaque dequeue réussi
          await persist();
        } else {
          // Erreur métier non récupérable — on retire la commande
          // pour ne pas bloquer les suivantes
          commandsById.delete(commandId);
          const idx = commandOrder.indexOf(commandId);
          if (idx !== -1) commandOrder.splice(idx, 1);
          // US-060 — persist même pour les erreurs métier non récupérables
          await persist();
        }
      } catch {
        // Erreur réseau — stop : les commandes restantes demeurent en file
        // US-060 — pas de persist ici : les commandes non traitées restent dans AsyncStorage
        break;
      }
    }
  }

  /** SC4 — Retourne true si la file est vide (autorisation de clôture) */
  function canCloseRoute(): boolean {
    return commandsById.size === 0;
  }

  /** SC5 — Nombre de commandes en attente */
  function getPendingCount(): number {
    return commandsById.size;
  }

  /** Retourne la file sous forme de tableau (ordre FIFO) */
  function toArray(): OfflineCommand[] {
    return commandOrder
      .map(id => commandsById.get(id))
      .filter((cmd): cmd is OfflineCommand => cmd !== undefined);
  }

  /** Taille de la file */
  function size(): number {
    return commandsById.size;
  }

  return {
    initialize,
    enqueue,
    sync,
    canCloseRoute,
    getPendingCount,
    toArray,
    size,
  };
}

export type OfflineQueue = ReturnType<typeof createOfflineQueue>;

// ─── Générateur d'UUID v7 simplifié ──────────────────────────────────────────
// UUID v7 = timestamp-ordered (monotonic) UUID.
// Implémentation simplifiée pour le MVP — utiliser la lib uuid@9 en prod.

/**
 * Génère un identifiant de commande unique avec composante temporelle.
 * Compatible avec les UUID v7 (timestamp-ordered).
 * Garantit l'idempotence côté serveur quand le même commandId est renvoyé.
 */
export function generateCommandId(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, '0');
  const randomHex = Math.random().toString(16).slice(2).padEnd(20, '0');
  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-7${randomHex.slice(0, 3)}-${randomHex.slice(3, 7)}-${randomHex.slice(7, 19)}`;
}
