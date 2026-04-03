/**
 * useConsignesLocales — Hook de persistance des consignes superviseur (US-037)
 *
 * Responsabilités :
 * - Charger les consignes du jour depuis AsyncStorage au montage.
 * - Persister une nouvelle consigne (sans doublon sur instructionId).
 * - Marquer une consigne "Exécutée" localement et synchroniser avec le backend.
 * - Retourner le badge (nombre de consignes non lues = statut ENVOYEE).
 *
 * Clé AsyncStorage : "consignes_jour_YYYY-MM-DD"
 * Les consignes d'un jour antérieur sont ignorées (nettoyage implicite).
 *
 * Architecture DDD :
 * - Ce hook est dans la couche Infrastructure (lecture/écriture store local).
 * - Il ne contient aucune règle métier — uniquement de la persistance et de l'orchestration.
 * - La synchronisation backend (marquerInstructionExecutee) est déléguée à supervisionApi.
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  InstructionMobileDTO,
  marquerInstructionExecutee,
  prendreEnCompteInstruction,
} from '../api/supervisionApi';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Consigne locale enrichie avec l'état de lecture.
 * Étend InstructionMobileDTO avec un champ `lue` pour le badge.
 */
export interface ConsigneLocale extends InstructionMobileDTO {
  /** true si le livreur a consulté "Mes consignes" après la réception */
  lue: boolean;
}

// ─── Clé de stockage ──────────────────────────────────────────────────────────

/**
 * Retourne la clé AsyncStorage du jour courant.
 * Format : "consignes_jour_YYYY-MM-DD"
 */
export function clePourAujourdhui(): string {
  return `consignes_jour_${new Date().toISOString().slice(0, 10)}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseConsignesLocalesResult {
  /** Liste des consignes du jour, triées par date décroissante */
  consignes: ConsigneLocale[];
  /** Nombre de consignes non lues (badge) */
  nombreNonLues: number;
  /** Persiste une instruction dans AsyncStorage (idempotent sur instructionId) */
  ajouterConsigne: (instruction: InstructionMobileDTO) => Promise<void>;
  /** Marque toutes les consignes comme lues (appelé à l'ouverture de MesConsignesScreen) */
  marquerToutesLues: () => Promise<void>;
  /** Marque une consigne "Exécutée" localement + PATCH backend */
  marquerExecutee: (instructionId: string) => Promise<void>;
  /**
   * Pour chaque consigne au statut ENVOYEE, appelle PATCH prendre-en-compte
   * et met à jour le statut local à PRISE_EN_COMPTE.
   * Si offline, les erreurs sont ignorées individuellement (réessai à la prochaine ouverture).
   * Appelé à l'ouverture de MesConsignesScreen.
   */
  prendreEnCompteNouvelles: () => Promise<void>;
  /** Indicateur de synchronisation en cours */
  syncEnCours: boolean;
}

export function useConsignesLocales(
  /** Override injectable pour les tests */
  marquerExecuteeFn: (id: string) => Promise<void> = marquerInstructionExecutee,
  /** Override injectable pour les tests (prise en compte) */
  prendreEnCompteFn: (id: string) => Promise<void> = prendreEnCompteInstruction
): UseConsignesLocalesResult {
  const [consignes, setConsignes] = useState<ConsigneLocale[]>([]);
  const [syncEnCours, setSyncEnCours] = useState(false);

  // ─── Chargement initial depuis AsyncStorage ─────────────────────────────

  const chargerConsignes = useCallback(async () => {
    try {
      const cle = clePourAujourdhui();
      const json = await AsyncStorage.getItem(cle);
      if (json) {
        const parsed: ConsigneLocale[] = JSON.parse(json);
        // Tri décroissant par horodatage
        parsed.sort(
          (a, b) =>
            new Date(b.horodatage).getTime() - new Date(a.horodatage).getTime()
        );
        setConsignes(parsed);
      }
    } catch {
      // Lecture silencieuse — l'historique n'est pas critique
    }
  }, []);

  useEffect(() => {
    chargerConsignes();
  }, [chargerConsignes]);

  // ─── Persistance ──────────────────────────────────────────────────────────

  const sauvegarder = useCallback(async (liste: ConsigneLocale[]) => {
    try {
      const cle = clePourAujourdhui();
      await AsyncStorage.setItem(cle, JSON.stringify(liste));
    } catch {
      // Écriture silencieuse
    }
  }, []);

  // ─── ajouterConsigne ──────────────────────────────────────────────────────

  const ajouterConsigne = useCallback(
    async (instruction: InstructionMobileDTO) => {
      setConsignes((prev) => {
        // Idempotence : pas de doublon sur instructionId
        if (prev.some((c) => c.instructionId === instruction.instructionId)) {
          return prev;
        }
        const nouvelle: ConsigneLocale = { ...instruction, lue: false };
        // Tri décroissant : plus récente en tête
        const miseAJour = [nouvelle, ...prev].sort(
          (a, b) =>
            new Date(b.horodatage).getTime() - new Date(a.horodatage).getTime()
        );
        // Persistance asynchrone (fire-and-forget)
        sauvegarder(miseAJour);
        return miseAJour;
      });
    },
    [sauvegarder]
  );

  // ─── marquerToutesLues ────────────────────────────────────────────────────

  const marquerToutesLues = useCallback(async () => {
    setConsignes((prev) => {
      const miseAJour = prev.map((c) => ({ ...c, lue: true }));
      sauvegarder(miseAJour);
      return miseAJour;
    });
  }, [sauvegarder]);

  // ─── marquerExecutee ──────────────────────────────────────────────────────

  const marquerExecutee = useCallback(
    async (instructionId: string) => {
      setSyncEnCours(true);
      try {
        // 1. PATCH backend (synchronisation superviseur)
        await marquerExecuteeFn(instructionId);

        // 2. Mise à jour locale du statut
        setConsignes((prev) => {
          const miseAJour = prev.map((c) =>
            c.instructionId === instructionId
              ? { ...c, statut: 'EXECUTEE', lue: true }
              : c
          );
          sauvegarder(miseAJour);
          return miseAJour;
        });
      } finally {
        setSyncEnCours(false);
      }
    },
    [marquerExecuteeFn, sauvegarder]
  );

  // ─── prendreEnCompteNouvelles ─────────────────────────────────────────────

  /**
   * Pour chaque consigne au statut ENVOYEE : PATCH prendre-en-compte.
   * Si le PATCH réussit → statut local passe à PRISE_EN_COMPTE.
   * Si le PATCH échoue (offline) → statut reste ENVOYEE, réessai à la prochaine ouverture.
   * Appelé à l'ouverture de MesConsignesScreen.
   */
  const prendreEnCompteNouvelles = useCallback(async () => {
    // Lire la liste courante via ref de consignes
    const nouvellesIds = consignes
      .filter((c) => c.statut === 'ENVOYEE')
      .map((c) => c.instructionId);

    if (nouvellesIds.length === 0) return;

    // Appel PATCH individuel pour chaque consigne ENVOYEE
    const resultats = await Promise.allSettled(
      nouvellesIds.map((id) => prendreEnCompteFn(id))
    );

    // Mise à jour locale uniquement pour les PATCHs qui ont réussi
    const idsReussis = new Set(
      nouvellesIds.filter((_, index) => resultats[index].status === 'fulfilled')
    );

    if (idsReussis.size > 0) {
      setConsignes((prev) => {
        const miseAJour = prev.map((c) =>
          idsReussis.has(c.instructionId) && c.statut === 'ENVOYEE'
            ? { ...c, statut: 'PRISE_EN_COMPTE' }
            : c
        );
        sauvegarder(miseAJour);
        return miseAJour;
      });
    }
    // Les PATCHs en échec (offline) sont silencieux — réessai à la prochaine ouverture
  }, [consignes, prendreEnCompteFn, sauvegarder]);

  // ─── Badge ────────────────────────────────────────────────────────────────

  const nombreNonLues = consignes.filter((c) => !c.lue).length;

  return {
    consignes,
    nombreNonLues,
    ajouterConsigne,
    marquerToutesLues,
    marquerExecutee,
    prendreEnCompteNouvelles,
    syncEnCours,
  };
}
