import React, { useEffect, useState, useRef, useCallback } from 'react';

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
}

export interface TableauDeBordDTO {
  tournees: VueTourneeDTO[];
  actives: number;
  aRisque: number;
  cloturees: number;
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
  fetchFn = fetch,
  wsFactory,
}: UseTableauDeBordOptions = {}): UseTableauDeBordResult {
  const [tableau, setTableau] = useState<TableauDeBordDTO | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [connecte, setConnecte] = useState(false);
  const [chargement, setChargement] = useState(true);
  // Bloquant 5 — horodatage de déconnexion (null = connecté)
  const [deconnecteDepuisMs, setDeconnecteDepuisMs] = useState<number | null>(null);
  const wsRef = useRef<MockWebSocket | WebSocket | null>(null);
  // Refs pour les callbacks stables (évite les reconnexions en boucle)
  const apiBaseUrlRef = useRef(apiBaseUrl);
  const wsBaseUrlRef = useRef(wsBaseUrl);
  const fetchFnRef = useRef(fetchFn);
  const wsFactoryRef = useRef(wsFactory);
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
    } catch {
      setErreur('Impossible de contacter le serveur.');
    } finally {
      setChargement(false);
    }
  }, []);

  const connecterWs = useCallback(() => {
    try {
      wsRef.current?.close();
      const ws = wsFactoryRef.current
        ? wsFactoryRef.current(`${wsBaseUrlRef.current}/ws/supervision`)
        : new WebSocket(`${wsBaseUrlRef.current}/ws/supervision`);

      wsRef.current = ws;

      ws.onopen = () => {
        setConnecte(true);
        setDeconnecteDepuisMs(null);
        setErreur(null);
      };
      ws.onclose = () => {
        setConnecte(false);
        setDeconnecteDepuisMs(Date.now());
      };
      ws.onerror = () => {
        setConnecte(false);
        setDeconnecteDepuisMs((prev) => prev ?? Date.now());
        setErreur('Connexion WebSocket perdue. Les données peuvent ne pas être à jour.');
      };
      ws.onmessage = (event: MessageEvent) => {
        try {
          const data: TableauDeBordDTO = JSON.parse(event.data);
          setTableau(data);
          setErreur(null);
        } catch {
          // Message non-JSON ignoré
        }
      };
    } catch {
      // WebSocket non disponible (tests ou env sans WS)
      setConnecte(false);
      setDeconnecteDepuisMs((prev) => prev ?? Date.now());
    }
  }, []);

  // Bloquant 5 — reconnexion manuelle
  const reconnecterManuellement = useCallback(() => {
    setDeconnecteDepuisMs(null);
    chargerTableau();
    connecterWs();
  }, [chargerTableau, connecterWs]);

  useEffect(() => {
    chargerTableau();
    connecterWs();

    return () => {
      wsRef.current?.close();
    };
  }, [chargerTableau, connecterWs]);

  return { tableau, erreur, connecte, chargement, actualiser: chargerTableau, reconnecterManuellement, deconnecteDepuisMs };
}

// ─── Composant LigneTournee ────────────────────────────────────────────────

interface LigneTourneeProps {
  tournee: VueTourneeDTO;
  onVoir?: (tourneeId: string) => void;
}

export const LigneTournee: React.FC<LigneTourneeProps> = ({ tournee, onVoir }) => {
  const couleurStatut: Record<StatutTourneeVue, string> = {
    EN_COURS: '#1976d2',
    A_RISQUE: '#e65100',
    CLOTUREE: '#388e3c',
  };

  const libelleStatut: Record<StatutTourneeVue, string> = {
    EN_COURS: 'En cours',
    A_RISQUE: 'A risque',
    CLOTUREE: 'Cloturee',
  };

  return (
    <tr
      data-testid={`ligne-tournee-${tournee.tourneeId}`}
      style={{
        background: tournee.statut === 'A_RISQUE' ? '#fff3e0' : 'transparent',
        borderLeft: tournee.statut === 'A_RISQUE' ? '4px solid #e65100' : '4px solid transparent',
      }}
    >
      {/* S1 — Livreur en donnée primaire, ID TMS en secondaire */}
      <td style={{ padding: '8px 12px' }}>
        <span style={{ fontWeight: 'bold', fontSize: 15 }}>{tournee.livreurNom}</span>
        <br />
        <span
          data-testid={`id-tms-${tournee.tourneeId}`}
          style={{ fontSize: 11, color: '#888' }}
        >
          {tournee.tourneeId}
        </span>
      </td>
      <td style={{ padding: '8px 12px' }}>
        {tournee.colisTraites} / {tournee.colisTotal}
        {/* S2 — Détail du retard visible directement si A_RISQUE */}
        {tournee.statut === 'A_RISQUE' && (
          <div
            data-testid={`detail-retard-${tournee.tourneeId}`}
            style={{ fontSize: 12, color: '#c62828', marginTop: 2 }}
          >
            {tournee.retardEstimeMinutes != null && (
              <span>Retard : {tournee.retardEstimeMinutes} min</span>
            )}
            {tournee.colisEnRetard != null && tournee.colisEnRetard > 0 && (
              <span style={{ marginLeft: 6 }}>({tournee.colisEnRetard} colis)</span>
            )}
          </div>
        )}
      </td>
      <td style={{ padding: '8px 12px' }}>
        <div style={{ background: '#e0e0e0', borderRadius: 4, height: 8, width: 100 }}>
          <div
            data-testid={`progress-${tournee.tourneeId}`}
            style={{
              background: couleurStatut[tournee.statut],
              width: `${tournee.pourcentage}%`,
              height: '100%',
              borderRadius: 4,
            }}
          />
        </div>
        <span style={{ fontSize: 12, color: '#555' }}>{tournee.pourcentage}%</span>
      </td>
      <td style={{ padding: '8px 12px' }}>
        <span
          data-testid={`badge-statut-${tournee.tourneeId}`}
          style={{
            background: tournee.statut === 'A_RISQUE' ? '#fff3e0' : '#f5f5f5',
            color: couleurStatut[tournee.statut],
            border: `1px solid ${couleurStatut[tournee.statut]}`,
            borderRadius: 12,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          {libelleStatut[tournee.statut]}
        </span>
      </td>
      <td style={{ padding: '8px 12px' }}>
        {onVoir && (
          <button
            data-testid={`btn-voir-${tournee.tourneeId}`}
            onClick={() => onVoir(tournee.tourneeId)}
            style={{
              padding: '4px 12px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
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
  <div
    data-testid="bandeau-resume"
    style={{ display: 'flex', gap: 16, marginBottom: 24 }}
  >
    <div
      data-testid="compteur-actives"
      style={compteurStyle('#1976d2')}
    >
      <span style={{ fontSize: 28, fontWeight: 'bold' }}>{actives}</span>
      <span style={{ fontSize: 13 }}>En cours</span>
    </div>
    <div
      data-testid="compteur-a-risque"
      style={compteurStyle('#e65100')}
    >
      <span style={{ fontSize: 28, fontWeight: 'bold' }}>{aRisque}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
        A risque
        {aRisque > 0 && (
          <span
            data-testid="point-alerte"
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#c62828',
              animation: 'clignoter 1s infinite',
            }}
          />
        )}
      </span>
    </div>
    <div
      data-testid="compteur-cloturees"
      style={compteurStyle('#388e3c')}
    >
      <span style={{ fontSize: 28, fontWeight: 'bold' }}>{cloturees}</span>
      <span style={{ fontSize: 13 }}>Cloturees</span>
    </div>
  </div>
);

const compteurStyle = (color: string): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: '#fafafa',
  border: `2px solid ${color}`,
  borderRadius: 8,
  padding: '12px 24px',
  color,
  minWidth: 100,
});

// ─── Composant principal TableauDeBordPage ────────────────────────────────

interface TableauDeBordPageProps {
  onVoirTournee?: (tourneeId: string) => void;
  onExporterBilan?: () => void; // S5 — export CSV depuis le tableau de bord
  apiBaseUrl?: string;
  wsBaseUrl?: string;
  fetchFn?: (url: string) => Promise<Response>;
  wsFactory?: (url: string) => MockWebSocket;
  alerteFn?: () => void; // injection pour les tests (remplace jouerAlerteAudio)
}

const TableauDeBordPage: React.FC<TableauDeBordPageProps> = ({
  onVoirTournee,
  onExporterBilan,
  apiBaseUrl,
  wsBaseUrl,
  fetchFn,
  wsFactory,
  alerteFn = jouerAlerteAudio,
}) => {
  const { tableau, erreur, connecte, chargement, reconnecterManuellement, deconnecteDepuisMs } = useTableauDeBord({
    apiBaseUrl,
    wsBaseUrl,
    fetchFn,
    wsFactory,
  });

  // Bloquant 5 — compteur "Déconnecté depuis X min" mis à jour chaque minute
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    if (connecte || deconnecteDepuisMs === null) return;
    const timer = setInterval(() => setMaintenant(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, [connecte, deconnecteDepuisMs]);

  const minutesDeconnecte = deconnecteDepuisMs !== null
    ? Math.floor((maintenant - deconnecteDepuisMs) / 60_000)
    : null;
  const [filtreStatut, setFiltreStatut] = useState<StatutTourneeVue | ''>('');
  // US-035 — Recherche multi-critères
  const [termeRecherche, setTermeRecherche] = useState('');

  // US-013 : alerte sonore unique lors de l'apparition de nouvelles tournées à risque
  const prevARisqueRef = useRef<number>(0);
  useEffect(() => {
    if (tableau === null) return;
    const courant = tableau.aRisque;
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

  return (
    <div data-testid="tableau-de-bord-page" style={{ fontFamily: 'sans-serif', padding: 24 }}>
      {/* S5 — En-tête avec bouton export CSV */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>Tableau de bord des tournées</h1>
        {onExporterBilan && tableau && (
          <button
            data-testid="btn-exporter-bilan"
            onClick={onExporterBilan}
            style={{
              padding: '8px 16px',
              background: '#388e3c',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Exporter le bilan
          </button>
        )}
      </div>

      {/* S4 — Bandeau déconnexion WebSocket : orange (alerte système, distinct du rouge métier) */}
      {!connecte && !chargement && (
        <div
          data-testid="bandeau-deconnexion"
          style={{
            background: '#b45309',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 4,
            marginBottom: 16,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ flex: 1 }}>
            Connexion temps réel indisponible — données potentiellement non à jour
            {minutesDeconnecte !== null && minutesDeconnecte > 0 && (
              <span data-testid="compteur-deconnexion">
                {' '}(Déconnecté depuis {minutesDeconnecte} min)
              </span>
            )}
          </span>
          <button
            data-testid="btn-reconnecter"
            onClick={reconnecterManuellement}
            style={{
              background: '#fff',
              color: '#b45309',
              border: 'none',
              borderRadius: 4,
              padding: '4px 12px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Reconnecter
          </button>
        </div>
      )}

      {/* Erreur */}
      {erreur && (
        <div
          data-testid="message-erreur"
          style={{ background: '#fdecea', color: '#c62828', padding: 12, borderRadius: 4, marginBottom: 16 }}
        >
          {erreur}
        </div>
      )}

      {chargement && <p data-testid="chargement">Chargement...</p>}

      {/* Bandeau résumé */}
      {tableau && (
        <BandeauResume
          actives={tableau.actives}
          aRisque={tableau.aRisque}
          cloturees={tableau.cloturees}
        />
      )}

      {/* US-035 — Champ de recherche multi-critères */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label htmlFor="champ-recherche" style={{ marginRight: 4, flexShrink: 0 }}>
          Rechercher :
        </label>
        <input
          id="champ-recherche"
          data-testid="champ-recherche"
          type="text"
          value={termeRecherche}
          onChange={(e) => setTermeRecherche(e.target.value)}
          placeholder="Livreur, code TMS (ex: T-205), zone (ex: Villeurbanne)..."
          style={{
            flex: 1,
            padding: '6px 12px',
            border: '1px solid #bdbdbd',
            borderRadius: 4,
            fontSize: 14,
          }}
        />
        {rechercheActive && (
          <button
            data-testid="lien-effacer-recherche"
            onClick={() => setTermeRecherche('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1976d2',
              cursor: 'pointer',
              fontSize: 13,
              textDecoration: 'underline',
              padding: 0,
              flexShrink: 0,
            }}
          >
            Effacer la recherche
          </button>
        )}
      </div>

      {/* Filtre statut */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="filtre-statut" style={{ marginRight: 8 }}>Filtrer par statut :</label>
        <select
          id="filtre-statut"
          data-testid="filtre-statut"
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as StatutTourneeVue | '')}
        >
          <option value="">Tous</option>
          <option value="EN_COURS">En cours</option>
          <option value="A_RISQUE">A risque</option>
          <option value="CLOTUREE">Cloturees</option>
        </select>
      </div>

      {/* Liste des tournées */}
      {tableau && (
        <table
          data-testid="liste-tournees"
          style={{ width: '100%', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
              <th style={{ padding: '8px 12px' }}>Livreur</th>
              <th style={{ padding: '8px 12px' }}>Colis</th>
              <th style={{ padding: '8px 12px' }}>Avancement</th>
              <th style={{ padding: '8px 12px' }}>Statut</th>
              <th style={{ padding: '8px 12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tourneesFiltrees.map((t) => (
              <LigneTournee
                key={t.tourneeId}
                tournee={t}
                onVoir={onVoirTournee}
              />
            ))}
          </tbody>
        </table>
      )}

      {/* US-035 SC5 — Message aucun résultat de recherche (distinct du message filtre) */}
      {tableau && aucunResultatRecherche && (
        <p data-testid="message-aucun-resultat-recherche">
          Aucune tournee ne correspond a votre recherche
        </p>
      )}

      {tableau && !aucunResultatRecherche && tourneesFiltrees.length === 0 && (
        <p data-testid="aucune-tournee">Aucune tournée correspondant au filtre.</p>
      )}
    </div>
  );
};

export default TableauDeBordPage;
