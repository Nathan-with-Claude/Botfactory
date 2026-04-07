import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Client as StompClient } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
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

// ─── Helpers badge statut colis ──────────────────────────────────────────────

function badgeColisClasses(statut: string): string {
  switch (statut) {
    case 'LIVRE':
      return 'inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-600 text-on-primary uppercase';
    case 'ECHEC':
      return 'inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-error-container text-on-error-container uppercase';
    case 'A_LIVRER':
    default:
      return 'inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary-container text-on-primary-container uppercase';
  }
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
  const wsRef = useRef<MockWebSocket | StompClient | null>(null);

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

    // WebSocket : écoute les mises à jour pour rafraîchir le détail de la tournée
    // Mode test : MockWebSocket injecté via wsFactory
    if (wsFactory) {
      const ws = wsFactory(`${apiBaseUrl}/ws/supervision`);
      wsRef.current = ws as unknown as StompClient;
      ws.onmessage = () => {
        chargerDetail();
        chargerInstructions();
      };
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      return () => ws.close();
    }

    // Mode production/dev : STOMP sur SockJS (même protocole que TableauDeBordPage)
    // Guard : ne pas activer STOMP si TextEncoder n'est pas disponible (jsdom / tests)
    if (typeof TextEncoder === 'undefined') {
      return; // Dégradé silencieux en environnement sans WebSocket (tests)
    }
    try {
      const client = new StompClient({
        webSocketFactory: () => new SockJS(`${apiBaseUrl}/ws/supervision`),
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe('/topic/tableau-de-bord', () => {
            chargerDetail();
            chargerInstructions();
          });
        },
      });
      client.activate();
      wsRef.current = client;
      return () => { client.deactivate(); };
    } catch {
      // WebSocket non disponible — dégradé silencieux
    }
  }, [chargerDetail, chargerInstructions, apiBaseUrl, wsFactory]);

  const estTourneeActive = detail?.tournee.statut === 'EN_COURS' || detail?.tournee.statut === 'A_RISQUE';
  const estARisque = detail?.tournee.statut === 'A_RISQUE';

  // ─── Tab bar helpers ─────────────────────────────────────────────────────────

  const tabActifClasses = 'border-b-2 border-primary text-primary font-bold px-4 py-4 text-sm flex items-center gap-2 cursor-pointer bg-transparent';
  const tabInactifClasses = 'border-b-2 border-transparent text-on-surface-variant hover:text-primary px-4 py-4 text-sm flex items-center gap-2 cursor-pointer bg-transparent';

  return (
    <div data-testid="detail-tournee-page" className="font-body p-6 bg-background min-h-screen">
      {/* Bouton retour */}
      {onRetour && (
        <button
          data-testid="btn-retour"
          onClick={onRetour}
          className="mb-4 flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors border border-outline-variant rounded-lg px-3 py-1.5 bg-surface-container-lowest"
        >
          <span className="material-symbols-outlined text-base leading-none">arrow_back</span>
          Retour au tableau de bord
        </button>
      )}

      {erreur && (
        <div
          data-testid="message-erreur"
          className="bg-error-container text-on-error-container px-4 py-3 rounded-xl mb-4 text-sm font-medium"
        >
          {erreur}
        </div>
      )}

      {chargement && (
        <p data-testid="chargement" className="text-on-surface-variant text-sm">
          Chargement...
        </p>
      )}

      {detail && (
        <>
          {/* Bandeau avancement */}
          <div
            data-testid="bandeau-avancement"
            className={[
              'rounded-xl p-5 mb-6',
              estARisque
                ? 'bg-[#fff3e0] border-l-4 border-orange-600'
                : 'bg-surface-container-low border border-outline-variant/20',
            ].join(' ')}
          >
            <h2 className="font-headline text-xl font-semibold text-on-surface tracking-tight m-0">
              Tournée {detail.tournee.tourneeId}
            </h2>
            <p className="mt-1 mb-0 text-sm text-on-surface-variant">
              Livreur : <strong className="text-on-surface">{detail.tournee.livreurNom}</strong>
            </p>
            <p className="mt-1 mb-2 text-sm text-on-surface-variant">
              Avancement :{' '}
              <strong className="text-on-surface">
                {detail.tournee.colisTraites} / {detail.tournee.colisTotal} colis
              </strong>
              {' '}({detail.tournee.pourcentage}%)
            </p>
            {/* Barre de progression */}
            <div className="bg-surface-container h-2 rounded-full w-full overflow-hidden">
              <div
                data-testid="barre-progression"
                className={[
                  'h-full rounded-full transition-all',
                  estARisque
                    ? 'bg-gradient-to-r from-tertiary to-error'
                    : 'bg-primary',
                ].join(' ')}
                style={{ width: `${detail.tournee.pourcentage}%` }}
              />
            </div>
            <span
              data-testid="badge-statut-tournee"
              className={[
                'inline-block mt-2 text-xs font-bold uppercase tracking-wide',
                estARisque ? 'text-orange-600' : 'text-primary',
              ].join(' ')}
            >
              {detail.tournee.statut}
            </span>
          </div>

          {/* Bandeau d'onglets */}
          <div className="flex items-center gap-8 border-b border-outline-variant/15 mb-6">
            <button
              data-testid="onglet-colis"
              onClick={() => setOnglet('colis')}
              className={onglet === 'colis' ? tabActifClasses : tabInactifClasses}
            >
              <span className="material-symbols-outlined text-base leading-none">list_alt</span>
              Colis ({detail.colis.length})
            </button>
            <button
              data-testid="onglet-incidents"
              onClick={() => setOnglet('incidents')}
              className={onglet === 'incidents' ? tabActifClasses : tabInactifClasses}
            >
              <span className="material-symbols-outlined text-base leading-none">report_problem</span>
              Incidents ({detail.incidents.length})
              {detail.incidents.length > 0 && (
                <span className="bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  {detail.incidents.length}
                </span>
              )}
            </button>
            <button
              data-testid="onglet-instructions"
              onClick={() => setOnglet('instructions')}
              className={onglet === 'instructions' ? tabActifClasses : tabInactifClasses}
            >
              <span className="material-symbols-outlined text-base leading-none">map</span>
              Instructions ({instructions.length})
              {instructions.filter(i => i.statut === 'ENVOYEE').length > 0 && (
                <span
                  data-testid="badge-instructions-en-attente"
                  className="bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                >
                  {instructions.filter(i => i.statut === 'ENVOYEE').length}
                </span>
              )}
            </button>
          </div>

          {/* Onglet Colis */}
          {onglet === 'colis' && (
            <table data-testid="liste-colis" className="w-full border-collapse bg-surface-container-lowest rounded-xl overflow-hidden">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">
                    Colis
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">
                    Adresse
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">
                    Motif
                  </th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-widest font-label">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail.colis.map((c) => (
                  <tr
                    key={c.colisId}
                    data-testid={`ligne-colis-${c.colisId}`}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-6 py-5 text-sm text-on-surface font-medium">{c.colisId}</td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant">{c.adresse}</td>
                    <td className="px-6 py-5">
                      <span
                        data-testid={`badge-colis-${c.colisId}`}
                        className={badgeColisClasses(c.statut)}
                      >
                        {c.statut}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-error italic text-[10px]">
                      {c.motifEchec ?? '—'}
                    </td>
                    <td className="px-6 py-5">
                      {c.statut === 'A_LIVRER' && estTourneeActive && onInstructionner && (
                        <button
                          data-testid={`btn-instructionner-${c.colisId}`}
                          onClick={() => onInstructionner(c.colisId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-md hover:bg-primary hover:text-on-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm leading-none">sticky_note_2</span>
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
            <div data-testid="liste-incidents" className="space-y-3">
              {detail.incidents.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Aucun incident signalé.</p>
              ) : (
                detail.incidents.map((inc, i) => (
                  <div
                    key={i}
                    data-testid={`incident-${inc.colisId}`}
                    className="bg-surface-container-lowest border border-outline-variant/20 border-l-4 border-l-error rounded-xl px-5 py-4"
                  >
                    <p className="font-bold text-sm text-on-surface m-0">
                      {inc.colisId} — {inc.adresse}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1 m-0">
                      Motif : <span className="text-error font-medium">{inc.motif}</span>
                    </p>
                    {inc.note && (
                      <p className="text-sm text-on-surface-variant mt-1 m-0">{inc.note}</p>
                    )}
                    <p className="text-xs text-outline mt-2 m-0">
                      {new Date(inc.horodatage).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Onglet Instructions — US-015 */}
          {onglet === 'instructions' && (
            <div data-testid="liste-instructions" className="space-y-3">
              {instructions.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Aucune instruction envoyée pour cette tournée.</p>
              ) : (
                instructions.map((instr) => (
                  <div
                    key={instr.instructionId}
                    data-testid={`instruction-${instr.instructionId}`}
                    className={[
                      'rounded-xl px-5 py-4 border-l-4',
                      instr.statut === 'ENVOYEE'
                        ? 'bg-[#fff8e1] border-l-[#ff9800]'
                        : 'bg-[#f1f8e9] border-l-[#388e3c]',
                    ].join(' ')}
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-sm font-bold text-on-surface">{instr.typeInstruction}</strong>
                      <span
                        data-testid={`statut-instruction-${instr.instructionId}`}
                        className={[
                          'text-[10px] font-bold px-2 py-0.5 rounded-full',
                          instr.statut === 'ENVOYEE'
                            ? 'text-[#e65100] bg-[#fff3e0]'
                            : 'text-[#2e7d32] bg-[#e8f5e9]',
                        ].join(' ')}
                      >
                        {instr.statut === 'ENVOYEE' ? 'En attente' : 'Exécutée'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant m-0">
                      Colis : <strong className="text-on-surface">{instr.colisId}</strong>
                      {instr.creneauCible && (
                        <span className="ml-2">
                          — Créneau : {new Date(instr.creneauCible).toLocaleString('fr-FR')}
                        </span>
                      )}
                    </p>
                    <div className="flex gap-3 mt-1 text-[11px] text-outline">
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
