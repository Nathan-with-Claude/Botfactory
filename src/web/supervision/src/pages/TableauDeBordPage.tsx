import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Client as StompClient } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Formate une durée de déconnexion WebSocket pour l'affichage dans le bandeau OFFLINE.
 * US-044 — Format adaptatif :
 *   - < 60 s   : "X s"
 *   - >= 60 s  : "X min Y s"
 *   - >= 3600 s: "X h Y min"
 *
 * @param ms - Durée en millisecondes
 * @returns Chaîne formatée
 */
export function formaterDureeDeconnexion(ms: number): string {
  const totalSecondes = Math.floor(ms / 1000);
  if (totalSecondes < 60) {
    return `${totalSecondes} s`;
  }
  const totalMinutes = Math.floor(totalSecondes / 60);
  if (totalMinutes < 60) {
    const secondesRestantes = totalSecondes % 60;
    return `${totalMinutes} min ${secondesRestantes} s`;
  }
  const heures = Math.floor(totalMinutes / 60);
  const minutesRestantes = totalMinutes % 60;
  return `${heures} h ${minutesRestantes} min`;
}

// ─── Alerte sonore discrète (US-013) ──────────────────────────────────────
// Génère un bip de 200ms via Web Audio API — injecté pour les tests.
export function jouerAlerteAudio(): void {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Environnement sans AudioContext (Node.js / tests) — ignoré
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatutTourneeVue = 'EN_COURS' | 'A_RISQUE' | 'CLOTUREE';

export interface VueTourneeDTO {
  tourneeId: string;
  livreurNom: string;
  colisTraites: number;
  colisTotal: number;
  pourcentage: number;
  statut: StatutTourneeVue;
  derniereActivite: string;
  // S2 — Détail du retard (optionnel, présent si statut=A_RISQUE)
  retardEstimeMinutes?: number;
  colisEnRetard?: number;
  // US-035 — Recherche multi-critères
  codeTMS?: string;
  zone?: string;
  // US-039 — Bilan de fin de journée (colonnes export CSV)
  nbLivres?: number;
  nbEchecs?: number;
}

export interface BandeauResumeDTO {
  actives: number;
  aRisque: number;
  cloturees: number;
}

export interface TableauDeBordDTO {
  bandeau: BandeauResumeDTO;
  tournees: VueTourneeDTO[];
}

// ─── Hook WebSocket + polling fallback ─────────────────────────────────────

interface UseTableauDeBordOptions {
  apiBaseUrl?: string;
  wsBaseUrl?: string;
  fetchFn?: (url: string) => Promise<Response>;
  // Injection WebSocket pour les tests
  wsFactory?: (url: string) => MockWebSocket;
}

export interface MockWebSocket {
  onmessage: ((event: { data: string }) => void) | null;
  onopen: (() => void) | null;
  onclose: (() => void) | null;
  onerror: ((error: unknown) => void) | null;
  close: () => void;
}

interface UseTableauDeBordResult {
  tableau: TableauDeBordDTO | null;
  erreur: string | null;
  connecte: boolean;
  chargement: boolean;
  actualiser: () => void;
  // Bloquant 5 — reconnexion manuelle + compteur déconnexion
  reconnecterManuellement: () => void;
  deconnecteDepuisMs: number | null;
}

export function useTableauDeBord({
  apiBaseUrl = 'http://localhost:8082',
  wsBaseUrl = 'ws://localhost:8082',
  fetchFn = (url: string) => fetch(url),
  wsFactory,
}: UseTableauDeBordOptions = {}): UseTableauDeBordResult {
  const [tableau, setTableau] = useState<TableauDeBordDTO | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [connecte, setConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  // Bloquant 5 — horodatage de déconnexion (null = connecté)
  const [deconnecteDepuisMs, setDeconnecteDepuisMs] = useState<number | null>(null);
  const wsRef = useRef<MockWebSocket | StompClient | null>(null);
  // Refs pour les callbacks stables (évite les reconnexions en boucle)
  const apiBaseUrlRef = useRef(apiBaseUrl);
  const wsBaseUrlRef = useRef(wsBaseUrl);
  const fetchFnRef = useRef(fetchFn);
  const wsFactoryRef = useRef(wsFactory);
  const chargerTableauRef = useRef<() => void>(() => {});
  apiBaseUrlRef.current = apiBaseUrl;
  wsBaseUrlRef.current = wsBaseUrl;
  fetchFnRef.current = fetchFn;
  wsFactoryRef.current = wsFactory;

  const chargerTableau = useCallback(async () => {
    try {
      const response = await fetchFnRef.current(`${apiBaseUrlRef.current}/api/supervision/tableau-de-bord`);
      if (!response.ok) {
        setErreur(`Erreur serveur (${response.status})`);
        return;
      }
      const data: TableauDeBordDTO = await response.json();
      setTableau(data);
      setErreur(null);
    } catch (e) {
      console.error('[TableauDeBord] Erreur fetch:', e);
      setErreur('Impossible de contacter le serveur.');
    } finally {
      setChargement(false);
    }
  }, []);

  chargerTableauRef.current = chargerTableau;

  const connecterWs = useCallback(() => {
    // Fermer la connexion précédente
    if (wsRef.current) {
      if (wsRef.current instanceof StompClient) {
        wsRef.current.deactivate();
      } else {
        (wsRef.current as MockWebSocket).close();
      }
    }

    // Mode test : utiliser le wsFactory injecté (MockWebSocket)
    if (wsFactoryRef.current) {
      const ws = wsFactoryRef.current(`${wsBaseUrlRef.current}/ws/supervision`);
      wsRef.current = ws as unknown as StompClient;
      ws.onopen = () => { setConnecte(true); setDeconnecteDepuisMs(null); setErreur(null); };
      ws.onclose = () => { setConnecte(false); setDeconnecteDepuisMs(Date.now()); };
      ws.onerror = () => {
        setConnecte(false);
        setDeconnecteDepuisMs((prev) => prev ?? Date.now());
        setErreur('Connexion WebSocket perdue. Les données peuvent ne pas être à jour.');
      };
      ws.onmessage = (event: { data: string }) => {
        try {
          const data: TableauDeBordDTO = JSON.parse(event.data);
          setTableau(data);
          setErreur(null);
        } catch { /* Message non-JSON ignoré */ }
      };
      return;
    }

    // Mode production/dev : STOMP sur SockJS
    try {
      const client = new StompClient({
        webSocketFactory: () => new SockJS(`${apiBaseUrlRef.current}/ws/supervision`),
        reconnectDelay: 5000,
        onConnect: () => {
          setConnecte(true);
          setDeconnecteDepuisMs(null);
          setErreur(null);
          // Rechargement HTTP au moment de la connexion WS pour récupérer les données
          // si le fetch initial avait échoué (backend en cours de démarrage).
          chargerTableauRef.current();
          client.subscribe('/topic/tableau-de-bord', (message) => {
            try {
              const data: TableauDeBordDTO = JSON.parse(message.body);
              setTableau(data);
              setErreur(null);
            } catch { /* Message non-JSON ignoré */ }
          });
        },
        onDisconnect: () => {
          setConnecte(false);
          setDeconnecteDepuisMs(Date.now());
        },
        onStompError: () => {
          setConnecte(false);
          setDeconnecteDepuisMs((prev) => prev ?? Date.now());
          setErreur('Connexion WebSocket perdue. Les données peuvent ne pas être à jour.');
        },
      });
      client.activate();
      wsRef.current = client;
    } catch {
      setConnecte(false);
      setDeconnecteDepuisMs((prev) => prev ?? Date.now());
    }
  }, []);

  // Bloquant 5 — reconnexion manuelle
  const reconnecterManuellement = useCallback(() => {
    setDeconnecteDepuisMs(null);
    setErreur(null);
    chargerTableau();
    connecterWs();
  }, [chargerTableau, connecterWs]);

  useEffect(() => {
    chargerTableau();
    connecterWs();

    return () => {
      if (wsRef.current instanceof StompClient) {
        wsRef.current.deactivate();
      } else if (wsRef.current) {
        (wsRef.current as MockWebSocket).close();
      }
    };
  }, [chargerTableau, connecterWs]);

  return { tableau, erreur, connecte, chargement, actualiser: chargerTableau, reconnecterManuellement, deconnecteDepuisMs };
}

// ─── Helpers visuels ─────────────────────────────────────────────────────────

function getInitiales(nom: string): string {
  return nom
    .split(' ')
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function badgeTourneeClasses(statut: StatutTourneeVue): { containerCls: string; badgeCls: string; label: string } {
  switch (statut) {
    case 'A_RISQUE':
      return {
        containerCls: '',
        badgeCls: 'inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-error-container text-on-error-container text-[10px] font-bold uppercase w-fit',
        label: 'A RISQUE',
      };
    case 'EN_COURS':
      return {
        containerCls: '',
        badgeCls: 'px-2 py-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold uppercase',
        label: 'EN COURS',
      };
    case 'CLOTUREE':
      return {
        containerCls: '',
        badgeCls: 'px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase',
        label: 'CLOTURÉE',
      };
  }
}

function progressBarColor(statut: StatutTourneeVue): string {
  if (statut === 'CLOTUREE') return 'bg-emerald-500';
  return 'bg-primary';
}

function pctColor(statut: StatutTourneeVue): string {
  if (statut === 'CLOTUREE') return 'text-emerald-600';
  return 'text-primary';
}

// ─── Composant LigneTournee ────────────────────────────────────────────────

interface LigneTourneeProps {
  tournee: VueTourneeDTO;
  onVoir?: (tourneeId: string) => void;
}

export const LigneTournee: React.FC<LigneTourneeProps> = ({ tournee, onVoir }) => {
  const badge = badgeTourneeClasses(tournee.statut);
  const estARisque = tournee.statut === 'A_RISQUE';
  const estCloturee = tournee.statut === 'CLOTUREE';

  return (
    <tr
      data-testid={`ligne-tournee-${tournee.tourneeId}`}
      data-statut={tournee.statut}
      className={[
        'transition-colors',
        estARisque
          ? 'bg-[#fff3e0] border-l-4 border-orange-600 hover:bg-orange-100/40'
          : estCloturee
            ? 'opacity-60 bg-surface-container-low/30'
            : 'hover:bg-slate-50',
      ].join(' ')}
    >
      {/* Livreur */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
            {getInitiales(tournee.livreurNom)}
          </div>
          <span className="font-bold text-sm">{tournee.livreurNom}</span>
        </div>
      </td>

      {/* Tournée — S1 : Code TMS (ex: T-201) */}
      <td className="px-6 py-5">
        <span
          data-testid={`id-tms-${tournee.tourneeId}`}
          className="text-xs font-bold px-2 py-1 bg-surface-container-high rounded text-on-surface-variant"
        >
          {tournee.codeTMS ?? tournee.tourneeId}
        </span>
      </td>

      {/* Avancement */}
      <td className="px-6 py-5">
        <div className="w-48">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-outline">
              {tournee.colisTraites} / {tournee.colisTotal} colis
            </span>
            <span className={`text-[10px] font-bold ${pctColor(tournee.statut)}`}>
              {tournee.pourcentage}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              data-testid={`progress-${tournee.tourneeId}`}
              className={`h-full rounded-full ${progressBarColor(tournee.statut)}`}
              style={{ width: `${tournee.pourcentage}%` }}
            />
          </div>
          {/* S2 — Détail du retard visible directement si A_RISQUE */}
          {estARisque && (
            <div
              data-testid={`detail-retard-${tournee.tourneeId}`}
              className="mt-1 text-[10px] font-medium text-error"
            >
              {tournee.retardEstimeMinutes != null && (
                <span>Retard {tournee.retardEstimeMinutes} min</span>
              )}
              {tournee.colisEnRetard != null && tournee.colisEnRetard > 0 && (
                <span className="ml-1">({tournee.colisEnRetard} colis)</span>
              )}
            </div>
          )}
        </div>
      </td>

      {/* Statut */}
      <td className="px-6 py-5">
        <div className="flex flex-col gap-1">
          <span
            data-testid={`badge-statut-${tournee.tourneeId}`}
            className={badge.badgeCls}
          >
            {estARisque && (
              <span className="w-1.5 h-1.5 rounded-full bg-error" />
            )}
            {badge.label}
          </span>
        </div>
      </td>

      {/* Activité */}
      <td className={`px-6 py-5 text-xs font-medium ${estARisque ? 'text-error' : 'text-on-surface-variant'}`}>
        {tournee.derniereActivite}
      </td>

      {/* Actions */}
      <td className="px-6 py-5 text-right">
        {onVoir && !estCloturee && (
          <button
            data-testid={`btn-voir-${tournee.tourneeId}`}
            onClick={() => onVoir(tournee.tourneeId)}
            className="px-4 py-1.5 text-xs font-bold text-primary border border-primary/20 rounded-md hover:bg-primary hover:text-white transition-all"
          >
            Voir
          </button>
        )}
      </td>
    </tr>
  );
};

// ─── Composant BandeauResume ──────────────────────────────────────────────

interface BandeauResumeProps {
  actives: number;
  aRisque: number;
  cloturees: number;
}

export const BandeauResume: React.FC<BandeauResumeProps> = ({ actives, aRisque, cloturees }) => (
  <section
    data-testid="bandeau-resume"
    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
  >
    {/* Actives */}
    <div
      data-testid="compteur-actives"
      className="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between border-l-4 border-primary shadow-sm"
    >
      <div>
        <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Active</p>
        <p className="text-4xl font-headline font-bold text-primary">{actives}</p>
      </div>
      <span className="material-symbols-outlined text-primary/20 text-5xl">local_shipping</span>
    </div>

    {/* Clôturées */}
    <div
      data-testid="compteur-cloturees"
      className="bg-surface-container-lowest p-6 rounded-xl flex items-center justify-between border-l-4 border-emerald-500 shadow-sm"
    >
      <div>
        <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Clôturées</p>
        <p className="text-4xl font-headline font-bold text-emerald-600">{cloturees}</p>
      </div>
      <span className="material-symbols-outlined text-emerald-500/20 text-5xl">check_circle</span>
    </div>

    {/* À risque */}
    <div
      data-testid="compteur-a-risque"
      className="bg-tertiary-fixed p-6 rounded-xl flex items-center justify-between border-l-4 border-tertiary shadow-sm"
    >
      <div>
        <p className="text-xs font-bold text-on-tertiary-fixed-variant uppercase tracking-wider mb-1">
          A risque
          {aRisque > 0 && (
            <span
              data-testid="point-alerte"
              className="inline-block ml-2 w-2 h-2 rounded-full bg-error animate-pulse align-middle"
            />
          )}
        </p>
        <p className="text-4xl font-headline font-bold text-tertiary">{aRisque}</p>
      </div>
      <span className="material-symbols-outlined text-tertiary/20 text-5xl">warning</span>
    </div>
  </section>
);

// ─── Composant principal TableauDeBordPage ────────────────────────────────

interface TableauDeBordPageProps {
  onVoirTournee?: (tourneeId: string) => void;
  onExporterBilan?: () => void; // S5 — export CSV depuis le tableau de bord
  apiBaseUrl?: string;
  wsBaseUrl?: string;
  fetchFn?: (url: string) => Promise<Response>;
  wsFactory?: (url: string) => MockWebSocket;
  alerteFn?: () => void; // injection pour les tests (remplace jouerAlerteAudio)
  postFn?: (url: string) => Promise<Response>; // injection pour les tests
}

const TableauDeBordPage: React.FC<TableauDeBordPageProps> = ({
  onVoirTournee,
  onExporterBilan,
  apiBaseUrl = 'http://localhost:8082',
  wsBaseUrl,
  fetchFn,
  wsFactory,
  alerteFn = jouerAlerteAudio,
  postFn,
}) => {
  const { tableau, erreur, connecte, chargement, actualiser, reconnecterManuellement, deconnecteDepuisMs } = useTableauDeBord({
    apiBaseUrl,
    wsBaseUrl,
    fetchFn,
    wsFactory,
  });

  const [resetEnCours, setResetEnCours] = React.useState(false);

  const handleFullReset = async () => {
    setResetEnCours(true);
    try {
      const doPost = postFn ?? ((url: string) => fetch(url, { method: 'POST' }));
      await doPost(`${apiBaseUrl}/dev/tms/full-reset`);
      actualiser();
    } catch {
      // erreur silencieuse — l'actualiser() rechargera les données
    } finally {
      setResetEnCours(false);
    }
  };

  const isDevMode = process.env.REACT_APP_AUTH_BYPASS === 'true';

  // US-044 — compteur "Déconnecté depuis X s / X min Y s / X h Y min" mis à jour chaque seconde
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    if (connecte || deconnecteDepuisMs === null) {
      setMaintenant(Date.now());
      return;
    }
    const timer = setInterval(() => setMaintenant(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [connecte, deconnecteDepuisMs]);

  const dureeDeconnexionMs = deconnecteDepuisMs !== null
    ? Math.max(0, maintenant - deconnecteDepuisMs)
    : null;

  const [filtreStatut, setFiltreStatut] = useState<StatutTourneeVue | ''>('');
  // US-035 — Recherche multi-critères
  const [termeRecherche, setTermeRecherche] = useState('');

  // US-013 : alerte sonore unique lors de l'apparition de nouvelles tournées à risque
  const prevARisqueRef = useRef<number>(0);
  useEffect(() => {
    if (tableau === null) return;
    const courant = tableau.bandeau.aRisque;
    if (courant > prevARisqueRef.current) {
      alerteFn();
    }
    prevARisqueRef.current = courant;
  }, [tableau, alerteFn]);

  // Tri : A_RISQUE en tête, puis EN_COURS, puis CLOTUREE
  const ordrePriorite: Record<StatutTourneeVue, number> = {
    A_RISQUE: 0,
    EN_COURS: 1,
    CLOTUREE: 2,
  };

  // US-035 — Fonction de recherche multi-critères (union OU : livreurNom, codeTMS, zone)
  const correspondRecherche = (t: VueTourneeDTO, terme: string): boolean => {
    if (!terme.trim()) return true;
    const termeLower = terme.toLowerCase();
    return (
      t.livreurNom.toLowerCase().includes(termeLower) ||
      (t.codeTMS?.toLowerCase().includes(termeLower) ?? false) ||
      (t.zone?.toLowerCase().includes(termeLower) ?? false)
    );
  };

  const tourneesFiltrees = (tableau?.tournees ?? [])
    .filter((t) => !filtreStatut || t.statut === filtreStatut)
    .filter((t) => correspondRecherche(t, termeRecherche))
    .sort((a, b) => ordrePriorite[a.statut] - ordrePriorite[b.statut]);

  const rechercheActive = termeRecherche.trim().length > 0;
  const aucunResultatRecherche = rechercheActive && tourneesFiltrees.length === 0;

  const filtresStatutConfig = [
    { key: '' as const,         label: 'Toutes' },
    { key: 'EN_COURS' as const, label: 'En cours' },
    { key: 'A_RISQUE' as const, label: 'A risque' },
    { key: 'CLOTUREE' as const, label: 'Clôturées' },
  ];

  return (
    <div data-testid="tableau-de-bord-page" className="font-body text-on-surface antialiased">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 text-xs text-outline">
        <span>DocuPost</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold">Supervision</span>
      </nav>

      {/* S4 — Bandeau déconnexion WebSocket : orange (alerte système) */}
      {!connecte && !chargement && (
        <div
          data-testid="bandeau-deconnexion"
          className="mb-6 px-4 py-3 rounded-lg bg-amber-700 text-white text-sm flex items-center gap-3 flex-wrap"
        >
          <span className="flex-1">
            Connexion temps réel indisponible — données potentiellement non à jour
            {dureeDeconnexionMs !== null && (
              <span data-testid="compteur-deconnexion">
                {' '}(Déconnecté depuis {formaterDureeDeconnexion(dureeDeconnexionMs)})
              </span>
            )}
          </span>
          <button
            data-testid="btn-reconnecter"
            onClick={reconnecterManuellement}
            className="bg-white text-amber-700 font-bold text-xs px-3 py-1.5 rounded-md hover:bg-amber-50 transition-all whitespace-nowrap"
          >
            Reconnecter
          </button>
        </div>
      )}

      {/* Erreur */}
      {erreur && (
        <div
          data-testid="message-erreur"
          className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-medium"
        >
          {erreur}
        </div>
      )}

      {chargement && (
        <p data-testid="chargement" className="py-8 text-center text-outline text-sm">
          Chargement...
        </p>
      )}

      {/* Bandeau KPIs */}
      {tableau && (
        <BandeauResume
          actives={tableau.bandeau.actives}
          aRisque={tableau.bandeau.aRisque}
          cloturees={tableau.bandeau.cloturees}
        />
      )}

      {/* Recherche + Filtres + Boutons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* US-035 — Champ de recherche multi-critères */}
        <div className="relative w-full md:w-96 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            id="champ-recherche"
            data-testid="champ-recherche"
            type="text"
            value={termeRecherche}
            onChange={(e) => setTermeRecherche(e.target.value)}
            placeholder="Rechercher un livreur..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>

        {/* Filtres statut — onglets pills (affichage) + select caché (compatibilité tests) */}
        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
          {filtresStatutConfig.map(({ key, label }) => (
            <button
              key={key || 'tous'}
              onClick={() => setFiltreStatut(key)}
              className={
                filtreStatut === key
                  ? 'px-4 py-1.5 text-xs font-bold bg-white shadow-sm rounded-lg text-primary'
                  : 'px-4 py-1.5 text-xs font-medium text-outline hover:text-on-surface transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </div>
        {/* Select natif caché — maintenu pour la compatibilité tests (fireEvent.change) */}
        <select
          id="filtre-statut"
          data-testid="filtre-statut"
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as StatutTourneeVue | '')}
          aria-hidden="true"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        >
          <option value="">Tous</option>
          <option value="EN_COURS">En cours</option>
          <option value="A_RISQUE">A risque</option>
          <option value="CLOTUREE">Clôturées</option>
        </select>

        {/* Boutons d'action */}
        <div className="flex items-center gap-3">
          {/* US-039 — Télécharger le bilan */}
          {tableau && tableau.tournees.length > 0 && (
            <button
              data-testid="btn-telecharger-bilan"
              onClick={() => onExporterBilan?.()}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Télécharger le bilan
            </button>
          )}
          {onExporterBilan && tableau && (
            <button
              data-testid="btn-exporter-bilan"
              onClick={onExporterBilan}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white text-sm font-bold rounded-lg hover:bg-emerald-800 transition-all"
            >
              <span className="material-symbols-outlined text-sm">file_download</span>
              Exporter le bilan
            </button>
          )}
          {/* Dev only — réinitialiser toutes les données (supervision + svc-tournee) */}
          {isDevMode && (
            <button
              data-testid="btn-full-reset"
              onClick={handleFullReset}
              disabled={resetEnCours}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 text-white text-sm font-bold rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
              title="Réinitialise les données de test (supervision + svc-tournee)"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              {resetEnCours ? 'Réinitialisation…' : 'Reset données dev'}
            </button>
          )}
        </div>
      </div>

      {/* Lien effacer recherche — US-035 */}
      {rechercheActive && (
        <div className="mb-4">
          <button
            data-testid="lien-effacer-recherche"
            onClick={() => setTermeRecherche('')}
            className="text-xs text-primary underline hover:text-primary-container transition-colors"
          >
            Effacer la recherche
          </button>
        </div>
      )}

      {/* Table tournées */}
      {tableau && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table
              data-testid="liste-tournees"
              className="w-full text-left border-collapse"
            >
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Livreur</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Tournée</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Avancement</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider">Activité</th>
                  <th className="px-6 py-4 text-xs font-bold text-outline uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {tourneesFiltrees.map((t) => (
                  <LigneTournee
                    key={t.tourneeId}
                    tournee={t}
                    onVoir={onVoirTournee}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Charger plus */}
          <div className="p-6 border-t border-outline-variant/5 flex justify-center">
            <button className="flex items-center gap-2 px-8 py-2.5 text-xs font-bold text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors rounded-lg">
              Charger plus
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        </div>
      )}

      {/* US-035 SC5 — Message aucun résultat de recherche */}
      {tableau && aucunResultatRecherche && (
        <p data-testid="message-aucun-resultat-recherche" className="mt-8 text-center text-outline text-sm">
          Aucune tournee ne correspond a votre recherche
        </p>
      )}

      {tableau && !aucunResultatRecherche && tourneesFiltrees.length === 0 && (
        <p data-testid="aucune-tournee" className="mt-8 text-center text-outline text-sm">
          Aucune tournée correspondant au filtre.
        </p>
      )}
    </div>
  );
};

export default TableauDeBordPage;
