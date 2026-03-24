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
  const wsRef = useRef<MockWebSocket | WebSocket | null>(null);

  const chargerTableau = useCallback(async () => {
    try {
      const response = await fetchFn(`${apiBaseUrl}/api/supervision/tableau-de-bord`);
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
  }, [apiBaseUrl, fetchFn]);

  useEffect(() => {
    // Chargement initial
    chargerTableau();

    // Connexion WebSocket
    try {
      const ws = wsFactory
        ? wsFactory(`${wsBaseUrl}/ws/supervision`)
        : new WebSocket(`${wsBaseUrl}/ws/supervision`);

      wsRef.current = ws;

      ws.onopen = () => setConnecte(true);
      ws.onclose = () => {
        setConnecte(false);
        // Polling fallback si WebSocket déconnecté
      };
      ws.onerror = () => {
        setConnecte(false);
        setErreur('Connexion WebSocket perdue. Les données peuvent ne pas être à jour.');
      };
      ws.onmessage = (event) => {
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
    }

    return () => {
      wsRef.current?.close();
    };
  }, [chargerTableau, wsBaseUrl, wsFactory]);

  return { tableau, erreur, connecte, chargement, actualiser: chargerTableau };
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
      <td style={{ padding: '8px 12px' }}>{tournee.tourneeId}</td>
      <td style={{ padding: '8px 12px' }}>{tournee.livreurNom}</td>
      <td style={{ padding: '8px 12px' }}>
        {tournee.colisTraites} / {tournee.colisTotal}
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
  apiBaseUrl?: string;
  wsBaseUrl?: string;
  fetchFn?: (url: string) => Promise<Response>;
  wsFactory?: (url: string) => MockWebSocket;
  alerteFn?: () => void; // injection pour les tests (remplace jouerAlerteAudio)
}

const TableauDeBordPage: React.FC<TableauDeBordPageProps> = ({
  onVoirTournee,
  apiBaseUrl,
  wsBaseUrl,
  fetchFn,
  wsFactory,
  alerteFn = jouerAlerteAudio,
}) => {
  const { tableau, erreur, connecte, chargement } = useTableauDeBord({
    apiBaseUrl,
    wsBaseUrl,
    fetchFn,
    wsFactory,
  });
  const [filtreStatut, setFiltreStatut] = useState<StatutTourneeVue | ''>('');

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

  const tourneesFiltrees = (tableau?.tournees ?? [])
    .filter((t) => !filtreStatut || t.statut === filtreStatut)
    .sort((a, b) => ordrePriorite[a.statut] - ordrePriorite[b.statut]);

  return (
    <div data-testid="tableau-de-bord-page" style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Tableau de bord des tournées</h1>

      {/* Bandeau déconnexion WebSocket */}
      {!connecte && !chargement && (
        <div
          data-testid="bandeau-deconnexion"
          style={{
            background: '#c62828',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: 4,
            marginBottom: 16,
            fontSize: 14,
          }}
        >
          Connexion temps réel indisponible — données potentiellement non à jour
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
              <th style={{ padding: '8px 12px' }}>Tournée</th>
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

      {tableau && tourneesFiltrees.length === 0 && (
        <p data-testid="aucune-tournee">Aucune tournée correspondant au filtre.</p>
      )}
    </div>
  );
};

export default TableauDeBordPage;
