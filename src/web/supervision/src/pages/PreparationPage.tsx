import React, { useEffect, useState, useCallback } from 'react';
import { calculerNiveauAlerte, genererTooltipPoids } from '../utils/alerteSurcharge';

// ─── Types BC-07 Planification ────────────────────────────────────────────────

export type StatutAffectation = 'NON_AFFECTEE' | 'AFFECTEE' | 'LANCEE';

export interface ZoneTourneeDTO {
  nom: string;
  nbColis: number;
}

export interface TourneePlanifieeDTO {
  id: string;
  codeTms: string;
  date: string;
  nbColis: number;
  zones: ZoneTourneeDTO[];
  statut: StatutAffectation;
  livreurId: string | null;
  livreurNom: string | null;
  vehiculeId: string | null;
  importeeLe: string;
  affecteeLe: string | null;
  lancee: string | null;
  compositionVerifiee: boolean;
  aDesAnomalies: boolean;
  // US-041 — Poids estimé et capacité véhicule pour alerte surcharge W-04
  poidsEstimeKg?: number;
  capaciteVehiculeKg?: number;
}

export interface PlanDuJourDTO {
  date: string;
  totalTournees: number;
  nonAffectees: number;
  affectees: number;
  lancees: number;
  tournees: TourneePlanifieeDTO[];
}

interface LancerToutesResponse {
  nbTourneesLancees: number;
  message: string;
}

// ─── Styles Badge Statut ──────────────────────────────────────────────────────

function badgeStatut(statut: StatutAffectation): { label: string; bg: string; color: string } {
  switch (statut) {
    case 'NON_AFFECTEE': return { label: 'NON AFFECTÉE', bg: '#dc3545', color: '#fff' };
    case 'AFFECTEE':     return { label: 'AFFECTÉE',     bg: '#198754', color: '#fff' };
    case 'LANCEE':       return { label: 'LANCÉE',       bg: '#0d6efd', color: '#fff' };
  }
}

// ─── Props + Composant Principal ──────────────────────────────────────────────

interface PreparationPageProps {
  apiBaseUrl?: string;
  fetchFn?: (url: string, options?: RequestInit) => Promise<Response>;
  onVoirDetail?: (id: string) => void;
  onAffecter?: (id: string) => void;
  /** S3 — Rappelée après un lancement de tournée réussi pour rediriger vers le tableau de bord */
  onTourneeeLancee?: () => void;
}

/**
 * PreparationPage — Écran W-04 (US-021)
 *
 * Affiche le plan du jour : liste des tournées TMS importées avec bandeau résumé,
 * filtres par statut, et actions (Affecter, Voir détail, Lancer).
 *
 * Source : US-021, US-024
 */
export default function PreparationPage({
  apiBaseUrl = 'http://localhost:8082',
  fetchFn = fetch,
  onVoirDetail,
  onAffecter,
  onTourneeeLancee,
}: PreparationPageProps) {

  const today = new Date().toISOString().slice(0, 10);

  const [plan, setPlan] = useState<PlanDuJourDTO | null>(null);
  const [filtre, setFiltre] = useState<StatutAffectation | 'TOUTES'>('TOUTES');
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);
  const [lancementEnCours, setLancementEnCours] = useState<string | null>(null);
  const [importEnCours, setImportEnCours] = useState(false);

  const chargerPlan = useCallback(async () => {
    setLoading(true);
    setErreur(null);
    try {
      const params = filtre !== 'TOUTES' ? `?statut=${filtre}` : '';
      const res = await fetchFn(`${apiBaseUrl}/api/planification/plans/${today}${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: PlanDuJourDTO = await res.json();
      setPlan(data);
    } catch (e) {
      setErreur('Impossible de charger le plan du jour. Vérifiez la connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, fetchFn, today, filtre]);

  useEffect(() => {
    chargerPlan();
  }, [chargerPlan]);

  const forcerImportTms = async () => {
    setImportEnCours(true);
    setErreur(null);
    try {
      const res = await fetchFn(`${apiBaseUrl}/dev/tms/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 4 }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await chargerPlan();
    } catch (e) {
      setErreur('Impossible de déclencher l\'import TMS simulé. Vérifiez que le backend tourne en profil dev.');
    } finally {
      setImportEnCours(false);
    }
  };

  const lancerTournee = async (id: string, codeTms: string) => {
    setLancementEnCours(id);
    try {
      const res = await fetchFn(`${apiBaseUrl}/api/planification/tournees/${id}/lancer`, { method: 'POST' });
      if (res.ok) {
        setMessageSucces(`Tournée ${codeTms} lancée avec succès.`);
        // S3 — Redirection automatique vers le tableau de bord après lancement
        if (onTourneeeLancee) {
          setTimeout(() => onTourneeeLancee(), 800);
        } else {
          setTimeout(() => setMessageSucces(null), 3000);
          chargerPlan();
        }
      } else if (res.status === 409) {
        setErreur(`Impossible de lancer la tournée ${codeTms} : affectation incomplète ou tournée déjà lancée.`);
      }
    } catch {
      setErreur('Erreur réseau lors du lancement.');
    } finally {
      setLancementEnCours(null);
    }
  };

  const lancerToutes = async () => {
    if (!window.confirm('Lancer toutes les tournées affectées ? Cette action est irréversible.')) return;
    try {
      const res = await fetchFn(`${apiBaseUrl}/api/planification/plans/${today}/lancer-toutes`, { method: 'POST' });
      if (res.ok) {
        const data: LancerToutesResponse = await res.json();
        setMessageSucces(data.message);
        setTimeout(() => setMessageSucces(null), 4000);
        chargerPlan();
      }
    } catch {
      setErreur('Erreur réseau lors du lancement groupé.');
    }
  };

  // ─── Rendu ──────────────────────────────────────────────────────────────────

  return (
    <div data-testid="preparation-page" style={{ fontFamily: 'sans-serif', padding: 16, maxWidth: 1100 }}>

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, margin: 0 }}>DocuPost Préparation — {today}</h1>
      </header>

      {/* Bandeau résumé */}
      {plan && (
        <div
          data-testid="bandeau-resume"
          style={{
            background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 6,
            padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 24
          }}
        >
          <span>Plan du jour : <strong data-testid="total-tournees">{plan.totalTournees}</strong> tournées</span>
          <span><strong style={{ color: '#dc3545' }}>{plan.nonAffectees}</strong> non affectées</span>
          <span><strong style={{ color: '#198754' }}>{plan.affectees}</strong> affectées</span>
          <span><strong style={{ color: '#0d6efd' }}>{plan.lancees}</strong> lancées</span>

          {plan.affectees > 0 && plan.lancees === 0 && (
            <button
              data-testid="btn-lancer-toutes"
              onClick={lancerToutes}
              style={{
                marginLeft: 'auto', background: '#0d6efd', color: '#fff',
                border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer'
              }}
            >
              LANCER TOUTES LES TOURNÉES
            </button>
          )}
          {plan.lancees === plan.totalTournees && plan.totalTournees > 0 && (
            <span
              data-testid="toutes-lancees-banniere"
              style={{ marginLeft: 'auto', color: '#198754', fontWeight: 'bold' }}
            >
              Toutes les tournées ont été lancées. Les livreurs ont reçu leur tournée.
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      {messageSucces && (
        <div data-testid="message-succes" style={{ background: '#d1e7dd', border: '1px solid #a3cfbb', borderRadius: 4, padding: '8px 12px', marginBottom: 8, color: '#0f5132' }}>
          {messageSucces}
        </div>
      )}
      {erreur && (
        <div data-testid="message-erreur" style={{ background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: 4, padding: '8px 12px', marginBottom: 8, color: '#842029' }}>
          {erreur}
        </div>
      )}

      {/* Filtres */}
      <div data-testid="filtres-statut" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        {(['TOUTES', 'NON_AFFECTEE', 'AFFECTEE', 'LANCEE'] as const).map(f => (
          <button
            key={f}
            data-testid={`filtre-${f}`}
            onClick={() => setFiltre(f)}
            style={{
              padding: '4px 12px', borderRadius: 4, cursor: 'pointer',
              background: filtre === f ? '#0d6efd' : '#e9ecef',
              color: filtre === f ? '#fff' : '#212529',
              border: 'none', fontWeight: filtre === f ? 'bold' : 'normal'
            }}
          >
            {f === 'TOUTES' ? 'Toutes' : f === 'NON_AFFECTEE' ? 'Non affectées' : f === 'AFFECTEE' ? 'Affectées' : 'Lancées'}
          </button>
        ))}
      </div>

      {/* Tableau */}
      {loading ? (
        <div data-testid="chargement">Chargement du plan du jour...</div>
      ) : !plan || plan.tournees.length === 0 ? (
        <div data-testid="aucune-tournee" style={{ color: '#6c757d', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>Aucune tournée importée pour aujourd'hui.</span>
          <button
            data-testid="bouton-forcer-import"
            onClick={forcerImportTms}
            disabled={importEnCours}
            style={{ padding: '6px 14px', borderRadius: 4, border: 'none', background: '#0d6efd', color: '#fff', cursor: importEnCours ? 'not-allowed' : 'pointer', opacity: importEnCours ? 0.7 : 1 }}
          >
            {importEnCours ? 'Import en cours…' : 'Forcer l\'import TMS'}
          </button>
        </div>
      ) : (
        <table data-testid="tableau-tournees" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#e9ecef', textAlign: 'left' }}>
              <th style={th}>Tournée</th>
              <th style={th}>Nb colis</th>
              <th style={th}>Zone(s)</th>
              {/* US-041 — Colonne Poids */}
              <th style={th} data-testid="colonne-poids-entete">Poids</th>
              <th style={th}>Statut</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plan.tournees.map(tournee => {
              const badge = badgeStatut(tournee.statut);
              const surcharge = tournee.aDesAnomalies;
              return (
                <tr
                  key={tournee.id}
                  data-testid={`ligne-tournee-${tournee.id}`}
                  style={{
                    borderBottom: '1px solid #dee2e6',
                    background: surcharge ? '#fff3cd' : 'white'
                  }}
                >
                  <td style={td}>
                    <strong>{tournee.codeTms}</strong>
                    {surcharge && (
                      <span data-testid={`anomalie-${tournee.id}`} style={{ marginLeft: 6, color: '#856404' }}>⚠ Charge</span>
                    )}
                  </td>
                  <td style={td}>{tournee.nbColis} colis</td>
                  <td style={td}>
                    {tournee.zones.slice(0, 2).map(z => (
                      <div key={z.nom} style={{ fontSize: 12 }}>{z.nom}</div>
                    ))}
                  </td>
                  {/* US-041 — Cellule Poids avec alerte surcharge */}
                  <td style={td} data-testid={`poids-${tournee.id}`}>
                    {tournee.poidsEstimeKg != null ? (
                      <>
                        <span>{tournee.poidsEstimeKg} kg</span>
                        {(() => {
                          const niveau = calculerNiveauAlerte(tournee.poidsEstimeKg!, tournee.capaciteVehiculeKg);
                          const tooltip = genererTooltipPoids(tournee.poidsEstimeKg!, tournee.capaciteVehiculeKg, niveau);
                          if (niveau === 'AUCUNE') return null;
                          return (
                            <span
                              data-testid={`alerte-surcharge-${tournee.id}`}
                              data-niveau={niveau}
                              title={tooltip ?? undefined}
                              style={{
                                marginLeft: 6,
                                color: niveau === 'CRITIQUE' ? '#c62828' : '#e65100',
                                fontWeight: 'bold',
                                cursor: 'help',
                              }}
                            >
                              {niveau === 'CRITIQUE' ? '⛔' : '⚠'}
                            </span>
                          );
                        })()}
                      </>
                    ) : (
                      <span style={{ color: '#9e9e9e', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={td}>
                    <span
                      data-testid={`badge-statut-${tournee.id}`}
                      style={{
                        background: badge.bg, color: badge.color,
                        borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 'bold'
                      }}
                    >
                      {badge.label}
                    </span>
                    {tournee.statut === 'AFFECTEE' && tournee.livreurNom && (
                      <div style={{ fontSize: 12, marginTop: 2 }}>
                        {tournee.livreurNom} / {tournee.vehiculeId}
                      </div>
                    )}
                    {tournee.statut === 'LANCEE' && tournee.livreurNom && (
                      <div style={{ fontSize: 12, marginTop: 2 }}>
                        {tournee.livreurNom} / {tournee.vehiculeId}
                      </div>
                    )}
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {/* Voir détail — toujours disponible */}
                      <button
                        data-testid={`btn-detail-${tournee.id}`}
                        onClick={() => onVoirDetail?.(tournee.id)}
                        style={btnSecondaire}
                      >
                        Voir détail
                      </button>

                      {/* Affecter — si NON_AFFECTEE */}
                      {tournee.statut === 'NON_AFFECTEE' && (
                        <button
                          data-testid={`btn-affecter-${tournee.id}`}
                          onClick={() => onAffecter?.(tournee.id)}
                          style={btnPrimaire}
                        >
                          Affecter
                        </button>
                      )}

                      {/* Lancer — si AFFECTEE */}
                      {tournee.statut === 'AFFECTEE' && (
                        <button
                          data-testid={`btn-lancer-${tournee.id}`}
                          onClick={() => lancerTournee(tournee.id, tournee.codeTms)}
                          disabled={lancementEnCours === tournee.id}
                          style={{ ...btnSucces, opacity: lancementEnCours === tournee.id ? 0.6 : 1 }}
                        >
                          {lancementEnCours === tournee.id ? 'Lancement...' : 'Lancer'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Styles utilitaires ──────────────────────────────────────────────────────

const th: React.CSSProperties = { padding: '8px 12px', fontWeight: 'bold', fontSize: 13 };
const td: React.CSSProperties = { padding: '8px 12px', verticalAlign: 'top' };
const btnPrimaire: React.CSSProperties = { background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 };
const btnSecondaire: React.CSSProperties = { background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 };
const btnSucces: React.CSSProperties = { background: '#198754', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 };
