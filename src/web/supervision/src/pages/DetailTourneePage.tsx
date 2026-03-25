import React, { useEffect, useState, useCallback } from 'react';
import { VueTourneeDTO, MockWebSocket } from './TableauDeBordPage';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VueColisDTO {
  colisId: string;
  adresse: string;
  statut: string;
  motifEchec?: string;
  horodatageTraitement?: string;
}

export interface IncidentVueDTO {
  colisId: string;
  adresse: string;
  motif: string;
  horodatage: string;
  note?: string;
}

export interface InstructionDTO {
  instructionId: string;
  tourneeId: string;
  colisId: string;
  superviseurId: string;
  typeInstruction: string;
  statut: string;
  creneauCible?: string;
  horodatage: string;
}

export interface VueTourneeDetailDTO {
  tournee: VueTourneeDTO;
  colis: VueColisDTO[];
  incidents: IncidentVueDTO[];
}

// ─── Composant DetailTourneePage ──────────────────────────────────────────────

interface DetailTourneePageProps {
  tourneeId: string;
  onRetour?: () => void;
  onInstructionner?: (colisId: string) => void;
  apiBaseUrl?: string;
  fetchFn?: (url: string) => Promise<Response>;
  wsFactory?: (url: string) => MockWebSocket;
}

/**
 * Composant — DetailTourneePage (US-012)
 *
 * Écran W-02 : détail d'une tournée superviseur.
 * Affiche :
 * - Bandeau avancement (VueTourneeDTO)
 * - Liste des colis (badge statut + bouton Instructionner si A_LIVRER + tournée active)
 * - Onglet Incidents
 * - Mise à jour WebSocket
 *
 * Source : US-012 — "Détail d'une tournée superviseur"
 */
const DetailTourneePage: React.FC<DetailTourneePageProps> = ({
  tourneeId,
  onRetour,
  onInstructionner,
  apiBaseUrl = 'http://localhost:8082',
  fetchFn = fetch,
  wsFactory,
}) => {
  const [detail, setDetail] = useState<VueTourneeDetailDTO | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [onglet, setOnglet] = useState<'colis' | 'incidents' | 'instructions'>('colis');
  const [instructions, setInstructions] = useState<InstructionDTO[]>([]);

  const chargerDetail = useCallback(async () => {
    try {
      const response = await fetchFn(
        `${apiBaseUrl}/api/supervision/tournees/${encodeURIComponent(tourneeId)}`
      );
      if (response.status === 404) {
        setErreur(`Tournée "${tourneeId}" introuvable.`);
        return;
      }
      if (!response.ok) {
        setErreur(`Erreur serveur (${response.status})`);
        return;
      }
      const data: VueTourneeDetailDTO = await response.json();
      setDetail(data);
      setErreur(null);
    } catch {
      setErreur('Impossible de contacter le serveur.');
    } finally {
      setChargement(false);
    }
  }, [apiBaseUrl, fetchFn, tourneeId]);

  const chargerInstructions = useCallback(async () => {
    try {
      const response = await fetchFn(
        `${apiBaseUrl}/api/supervision/instructions/tournee/${encodeURIComponent(tourneeId)}`
      );
      if (response.ok) {
        const data: unknown = await response.json();
        if (Array.isArray(data)) {
          setInstructions(data as InstructionDTO[]);
        }
      }
    } catch {
      // Échec silencieux — les instructions ne bloquent pas l'affichage
    }
  }, [apiBaseUrl, fetchFn, tourneeId]);

  useEffect(() => {
    chargerDetail();
    chargerInstructions();

    // WebSocket : écoute les mises à jour du tableau de bord pour rafraîchir
    try {
      const ws = wsFactory
        ? wsFactory(`${apiBaseUrl}/ws/supervision`)
        : new WebSocket(`${apiBaseUrl.replace('http', 'ws')}/ws/supervision`);

      ws.onmessage = () => {
        chargerDetail();
        chargerInstructions();
      };

      return () => ws.close();
    } catch {
      // WebSocket non disponible
    }
  }, [chargerDetail, chargerInstructions, apiBaseUrl, wsFactory]);

  const estTourneeActive = detail?.tournee.statut === 'EN_COURS' || detail?.tournee.statut === 'A_RISQUE';

  const couleurStatut: Record<string, string> = {
    LIVRE: '#388e3c',
    ECHEC: '#c62828',
    A_LIVRER: '#1976d2',
  };

  return (
    <div data-testid="detail-tournee-page" style={{ fontFamily: 'sans-serif', padding: 24 }}>
      {/* Bouton retour */}
      {onRetour && (
        <button
          data-testid="btn-retour"
          onClick={onRetour}
          style={{ marginBottom: 16, background: 'none', border: '1px solid #ccc', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}
        >
          ← Retour au tableau de bord
        </button>
      )}

      {erreur && (
        <div data-testid="message-erreur" style={{ background: '#fdecea', color: '#c62828', padding: 12, borderRadius: 4, marginBottom: 16 }}>
          {erreur}
        </div>
      )}

      {chargement && <p data-testid="chargement">Chargement...</p>}

      {detail && (
        <>
          {/* Bandeau avancement */}
          <div
            data-testid="bandeau-avancement"
            style={{
              background: detail.tournee.statut === 'A_RISQUE' ? '#fff3e0' : '#f5f5f5',
              border: detail.tournee.statut === 'A_RISQUE' ? '2px solid #e65100' : '1px solid #e0e0e0',
              borderRadius: 8,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <h2 style={{ margin: 0 }}>Tournée {detail.tournee.tourneeId}</h2>
            <p style={{ margin: '4px 0' }}>Livreur : <strong>{detail.tournee.livreurNom}</strong></p>
            <p style={{ margin: '4px 0' }}>
              Avancement : <strong>{detail.tournee.colisTraites} / {detail.tournee.colisTotal} colis</strong>
              {' '}({detail.tournee.pourcentage}%)
            </p>
            <div style={{ background: '#e0e0e0', borderRadius: 4, height: 10, width: '100%', margin: '8px 0' }}>
              <div
                data-testid="barre-progression"
                style={{
                  background: detail.tournee.statut === 'A_RISQUE' ? '#e65100' : '#1976d2',
                  width: `${detail.tournee.pourcentage}%`,
                  height: '100%',
                  borderRadius: 4,
                }}
              />
            </div>
            <span
              data-testid="badge-statut-tournee"
              style={{
                fontWeight: 'bold',
                color: detail.tournee.statut === 'A_RISQUE' ? '#e65100' : '#1976d2',
              }}
            >
              {detail.tournee.statut}
            </span>
          </div>

          {/* Onglets */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              data-testid="onglet-colis"
              onClick={() => setOnglet('colis')}
              style={{
                padding: '6px 16px',
                borderRadius: 4,
                border: 'none',
                background: onglet === 'colis' ? '#1976d2' : '#e0e0e0',
                color: onglet === 'colis' ? '#fff' : '#333',
                cursor: 'pointer',
              }}
            >
              Colis ({detail.colis.length})
            </button>
            <button
              data-testid="onglet-incidents"
              onClick={() => setOnglet('incidents')}
              style={{
                padding: '6px 16px',
                borderRadius: 4,
                border: 'none',
                background: onglet === 'incidents' ? '#c62828' : '#e0e0e0',
                color: onglet === 'incidents' ? '#fff' : '#333',
                cursor: 'pointer',
              }}
            >
              Incidents ({detail.incidents.length})
            </button>
            <button
              data-testid="onglet-instructions"
              onClick={() => setOnglet('instructions')}
              style={{
                padding: '6px 16px',
                borderRadius: 4,
                border: 'none',
                background: onglet === 'instructions' ? '#6a1b9a' : '#e0e0e0',
                color: onglet === 'instructions' ? '#fff' : '#333',
                cursor: 'pointer',
              }}
            >
              Instructions ({instructions.length})
              {instructions.filter(i => i.statut === 'ENVOYEE').length > 0 && (
                <span
                  data-testid="badge-instructions-en-attente"
                  style={{
                    marginLeft: 6,
                    background: '#ff9800',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '1px 7px',
                    fontSize: 11,
                    fontWeight: 'bold',
                  }}
                >
                  {instructions.filter(i => i.statut === 'ENVOYEE').length}
                </span>
              )}
            </button>
          </div>

          {/* Onglet Colis */}
          {onglet === 'colis' && (
            <table data-testid="liste-colis" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                  <th style={{ padding: '6px 12px' }}>Colis</th>
                  <th style={{ padding: '6px 12px' }}>Adresse</th>
                  <th style={{ padding: '6px 12px' }}>Statut</th>
                  <th style={{ padding: '6px 12px' }}>Motif</th>
                  <th style={{ padding: '6px 12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {detail.colis.map((c) => (
                  <tr key={c.colisId} data-testid={`ligne-colis-${c.colisId}`}>
                    <td style={{ padding: '6px 12px' }}>{c.colisId}</td>
                    <td style={{ padding: '6px 12px' }}>{c.adresse}</td>
                    <td style={{ padding: '6px 12px' }}>
                      <span
                        data-testid={`badge-colis-${c.colisId}`}
                        style={{
                          color: couleurStatut[c.statut] ?? '#555',
                          fontWeight: 'bold',
                          fontSize: 12,
                        }}
                      >
                        {c.statut}
                      </span>
                    </td>
                    <td style={{ padding: '6px 12px', color: '#c62828' }}>
                      {c.motifEchec ?? '—'}
                    </td>
                    <td style={{ padding: '6px 12px' }}>
                      {c.statut === 'A_LIVRER' && estTourneeActive && onInstructionner && (
                        <button
                          data-testid={`btn-instructionner-${c.colisId}`}
                          onClick={() => onInstructionner(c.colisId)}
                          style={{
                            padding: '3px 10px',
                            background: '#ff9800',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          Instructionner
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Onglet Incidents */}
          {onglet === 'incidents' && (
            <div data-testid="liste-incidents">
              {detail.incidents.length === 0 ? (
                <p>Aucun incident signalé.</p>
              ) : (
                detail.incidents.map((inc, i) => (
                  <div
                    key={i}
                    data-testid={`incident-${inc.colisId}`}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 6,
                      padding: 12,
                      marginBottom: 8,
                      borderLeft: '4px solid #c62828',
                    }}
                  >
                    <strong>{inc.colisId}</strong> — {inc.adresse}
                    <br />
                    Motif : <span style={{ color: '#c62828' }}>{inc.motif}</span>
                    {inc.note && <div style={{ color: '#555', marginTop: 4 }}>{inc.note}</div>}
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                      {new Date(inc.horodatage).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Onglet Instructions — US-015 */}
          {onglet === 'instructions' && (
            <div data-testid="liste-instructions">
              {instructions.length === 0 ? (
                <p>Aucune instruction envoyée pour cette tournée.</p>
              ) : (
                instructions.map((instr) => (
                  <div
                    key={instr.instructionId}
                    data-testid={`instruction-${instr.instructionId}`}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 6,
                      padding: 12,
                      marginBottom: 8,
                      borderLeft: `4px solid ${instr.statut === 'ENVOYEE' ? '#ff9800' : '#388e3c'}`,
                      background: instr.statut === 'ENVOYEE' ? '#fff8e1' : '#f1f8e9',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{instr.typeInstruction}</strong>
                      <span
                        data-testid={`statut-instruction-${instr.instructionId}`}
                        style={{
                          fontWeight: 'bold',
                          fontSize: 12,
                          color: instr.statut === 'ENVOYEE' ? '#e65100' : '#2e7d32',
                          background: instr.statut === 'ENVOYEE' ? '#fff3e0' : '#e8f5e9',
                          padding: '2px 8px',
                          borderRadius: 10,
                        }}
                      >
                        {instr.statut === 'ENVOYEE' ? 'En attente' : 'Exécutée'}
                      </span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: '#555' }}>
                      Colis : <strong>{instr.colisId}</strong>
                      {instr.creneauCible && (
                        <span style={{ marginLeft: 8 }}>
                          — Créneau : {new Date(instr.creneauCible).toLocaleString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: '#888', display: 'flex', gap: 12 }}>
                      <span>Envoyée par : {instr.superviseurId}</span>
                      <span>{new Date(instr.horodatage).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DetailTourneePage;
