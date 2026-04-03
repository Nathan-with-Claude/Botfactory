import React, { useEffect, useState } from 'react';

// ─── Types BC-07 Planification ────────────────────────────────────────────────

export interface ZoneTourneeDTO { nom: string; nbColis: number; }
export interface ContrainteHoraireDTO { libelle: string; nbColisAffectes: number; }
export interface AnomalieDTO { code: string; description: string; }

export interface TourneePlanifieeDetailDTO {
  id: string;
  codeTms: string;
  date: string;
  nbColis: number;
  zones: ZoneTourneeDTO[];
  contraintes: ContrainteHoraireDTO[];
  anomalies: AnomalieDTO[];
  statut: string;
  livreurId: string | null;
  livreurNom: string | null;
  vehiculeId: string | null;
  importeeLe: string;
  affecteeLe: string | null;
  lancee: string | null;
  compositionVerifiee: boolean;
  poidsEstimeKg?: number | null;
}

export interface LivreurDisponible { id: string; nom: string; disponible: boolean; tourneeAffectee?: string; }
export interface VehiculeDisponible { id: string; disponible: boolean; tourneeAffectee?: string; capaciteKg?: number; }

// ─── Types compatibilité véhicule (US-030 / US-034) ──────────────────────────

export type ResultatCompatibilite = 'COMPATIBLE' | 'DEPASSEMENT' | 'POIDS_ABSENT';

export interface CompatibiliteVehiculeDTO {
  resultat: ResultatCompatibilite;
  poidsEstimeKg: number | null;
  capaciteKg: number;
  margeOuDepassementKg: number;
  vehiculeId: string;
  message: string;
}

export interface VehiculeCompatibleDTO {
  vehiculeId: string;
  immatriculation: string;
  capaciteKg: number;
  typeVehicule: string;
  disponible: boolean;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DetailTourneePlanifieePageProps {
  tourneePlanifieeId: string;
  apiBaseUrl?: string;
  fetchFn?: (url: string, options?: RequestInit) => Promise<Response>;
  onRetour?: () => void;
  livreurs?: LivreurDisponible[];
  vehicules?: VehiculeDisponible[];
}

/**
 * DetailTourneePlanifieePage — Écran W-05 (US-022 + US-023 + US-024 + US-030 + US-034)
 *
 * Deux onglets :
 * - Composition : zones, contraintes, anomalies (US-022)
 * - Affectation : sélecteurs livreur + véhicule, vérification compatibilité (US-023/030),
 *                 panneau de réaffectation (US-034)
 *
 * Source : US-022, US-023, US-024, US-030, US-034
 */
export default function DetailTourneePlanifieePage({
  tourneePlanifieeId,
  apiBaseUrl = 'http://localhost:8082',
  fetchFn = fetch.bind(window),
  onRetour,
  livreurs = livreursMock,
  vehicules = vehiculesMock,
}: DetailTourneePlanifieePageProps) {

  const [detail, setDetail] = useState<TourneePlanifieeDetailDTO | null>(null);
  const [ongletActif, setOngletActif] = useState<'composition' | 'affectation'>('composition');
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [messageSucces, setMessageSucces] = useState<string | null>(null);

  // Affectation
  const [livreurSelectionne, setLivreurSelectionne] = useState('');
  const [vehiculeSelectionne, setVehiculeSelectionne] = useState('');
  const [actionEnCours, setActionEnCours] = useState(false);

  // Compatibilité véhicule (US-030)
  const [compatibilite, setCompatibilite] = useState<CompatibiliteVehiculeDTO | null>(null);
  const [depassementForce, setDepassementForce] = useState(false);

  // Réaffectation véhicule (US-034)
  const [panneauReaffectationOuvert, setPanneauReaffectationOuvert] = useState(false);
  const [vehiculesCompatibles, setVehiculesCompatibles] = useState<VehiculeCompatibleDTO[]>([]);
  const [chargementVehicules, setChargementVehicules] = useState(false);

  useEffect(() => {
    chargerDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourneePlanifieeId]);

  // Réinitialiser la compatibilité quand le véhicule change
  useEffect(() => {
    setCompatibilite(null);
    setDepassementForce(false);
    setPanneauReaffectationOuvert(false);

    if (vehiculeSelectionne && livreurSelectionne) {
      verifierCompatibiliteVehicule(vehiculeSelectionne);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculeSelectionne]);

  const chargerDetail = async () => {
    setLoading(true);
    setErreur(null);
    try {
      const res = await fetchFn(`${apiBaseUrl}/api/planification/tournees/${tourneePlanifieeId}`);
      if (res.status === 404) { setErreur('Tournée introuvable.'); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: TourneePlanifieeDetailDTO = await res.json();
      setDetail(data);
      if (data.livreurId) setLivreurSelectionne(data.livreurId);
      if (data.vehiculeId) setVehiculeSelectionne(data.vehiculeId);
    } catch {
      setErreur('Impossible de charger le détail de la tournée.');
    } finally {
      setLoading(false);
    }
  };

  // ─── US-030 : Vérification compatibilité véhicule ─────────────────────────

  const verifierCompatibiliteVehicule = async (vehiculeId: string) => {
    if (!vehiculeId || !detail?.poidsEstimeKg) return;
    try {
      const res = await fetchFn(
        `${apiBaseUrl}/api/planification/tournees/${tourneePlanifieeId}/verifier-compatibilite-vehicule`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehiculeId, forcerSiDepassement: false }),
        }
      );
      const data: CompatibiliteVehiculeDTO = await res.json();
      setCompatibilite(data);
    } catch {
      // Silencieux — la vérification est optionnelle
    }
  };

  const forcerAffectationMalgreDepassement = async () => {
    if (!vehiculeSelectionne) return;
    try {
      const res = await fetchFn(
        `${apiBaseUrl}/api/planification/tournees/${tourneePlanifieeId}/verifier-compatibilite-vehicule`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehiculeId: vehiculeSelectionne, forcerSiDepassement: true }),
        }
      );
      const data: CompatibiliteVehiculeDTO = await res.json();
      setCompatibilite(data);
      setDepassementForce(true);
      setPanneauReaffectationOuvert(false);
    } catch {
      setErreur('Erreur lors du forçage de l\'affectation.');
    }
  };

  // ─── US-034 : Réaffectation vers un véhicule plus grand ───────────────────

  const ouvrirPanneauReaffectation = async () => {
    setPanneauReaffectationOuvert(true);
    setChargementVehicules(true);
    try {
      const poidsMin = compatibilite?.poidsEstimeKg ?? detail?.poidsEstimeKg ?? 0;
      const res = await fetchFn(
        `${apiBaseUrl}/api/planification/vehicules/compatibles?poidsMinKg=${poidsMin}&date=${detail?.date ?? ''}`
      );
      if (res.ok) {
        const data: VehiculeCompatibleDTO[] = await res.json();
        setVehiculesCompatibles(data);
      }
    } catch {
      setVehiculesCompatibles([]);
    } finally {
      setChargementVehicules(false);
    }
  };

  const selectionnerVehiculeCompatible = async (vehiculeId: string) => {
    setActionEnCours(true);
    try {
      const res = await fetchFn(
        `${apiBaseUrl}/api/planification/tournees/${tourneePlanifieeId}/reaffecter-vehicule`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nouveauVehiculeId: vehiculeId }),
        }
      );
      const data: CompatibiliteVehiculeDTO = await res.json();
      if (res.ok && data.resultat === 'COMPATIBLE') {
        setCompatibilite(data);
        setVehiculeSelectionne(vehiculeId);
        setPanneauReaffectationOuvert(false);
        setDepassementForce(false);
        setMessageSucces(`Véhicule réaffecté : ${vehiculeId} (${data.capaciteKg} kg — marge ${data.margeOuDepassementKg} kg).`);
        setTimeout(() => setMessageSucces(null), 4000);
      } else if (res.status === 409) {
        setErreur(`Ce véhicule est encore insuffisant (dépassement de ${data.margeOuDepassementKg} kg).`);
      }
    } catch {
      setErreur('Erreur lors de la réaffectation.');
    } finally {
      setActionEnCours(false);
    }
  };

  // ─── Helpers affectation ──────────────────────────────────────────────────

  // ─── US-038 : Export composition en CSV ──────────────────────────────────
  // Libellé bouton : "Télécharger la liste" (anciennement "Exporter CSV")

  const telechargerListeCSV = () => {
    if (!detail) return;
    const lignes: string[] = [
      'Tournée;Date;Nb colis',
      `${detail.codeTms};${detail.date};${detail.nbColis}`,
      '',
      'Zone;Nb colis',
      ...detail.zones.map(z => `${z.nom};${z.nbColis}`),
    ];
    const contenu = lignes.join('\n');
    const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `composition-${detail.codeTms}-${detail.date}.csv`;
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    URL.revokeObjectURL(url);
  };

  const validerComposition = async () => {
    setActionEnCours(true);
    try {
      const res = await fetchFn(
        `${apiBaseUrl}/api/planification/tournees/${tourneePlanifieeId}/composition/valider`,
        { method: 'POST' }
      );
      if (res.ok) {
        const data: TourneePlanifieeDetailDTO = await res.json();
        setDetail(data);
        setMessageSucces('Composition vérifiée et enregistrée.');
        setTimeout(() => setMessageSucces(null), 3000);
      }
    } catch {
      setErreur('Erreur lors de la validation de la composition.');
    } finally {
      setActionEnCours(false);
    }
  };

  const affecterSeulement = async () => {
    await execAffectation(false);
  };

  const affecterEtLancer = async () => {
    if (!detail) return;
    const msg = `Lancer la tournée ${detail.codeTms} pour ${livreurNomSelectionne()} ? Cette action est irréversible.`;
    if (!window.confirm(msg)) return;
    await execAffectation(true);
  };

  const execAffectation = async (etLancer: boolean) => {
    setActionEnCours(true);
    setErreur(null);
    try {
      const livreurObj = livreurs.find(l => l.id === livreurSelectionne);
      const res = await fetchFn(
        `${apiBaseUrl}/api/planification/tournees/${tourneePlanifieeId}/affecter`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            livreurId: livreurSelectionne,
            livreurNom: livreurObj?.nom ?? livreurSelectionne,
            vehiculeId: vehiculeSelectionne,
          }),
        }
      );
      if (res.status === 409) {
        setErreur('Ce livreur ou ce véhicule est déjà affecté à une autre tournée ce jour.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessageSucces(`Affectation enregistrée pour ${detail?.codeTms} — ${livreurNomSelectionne()} / ${vehiculeSelectionne}.`);
      setTimeout(() => setMessageSucces(null), 3000);

      if (etLancer) {
        const resLancer = await fetchFn(
          `${apiBaseUrl}/api/planification/tournees/${tourneePlanifieeId}/lancer`,
          { method: 'POST' }
        );
        if (resLancer.ok) {
          setMessageSucces(`Tournée ${detail?.codeTms} lancée ! ${livreurNomSelectionne()} a reçu sa tournée.`);
          setTimeout(() => setMessageSucces(null), 4000);
        } else if (resLancer.status === 409) {
          setErreur('Affectation enregistrée mais impossible de lancer la tournée.');
        }
      }
      chargerDetail();
    } catch {
      setErreur('Erreur réseau lors de l\'affectation.');
    } finally {
      setActionEnCours(false);
    }
  };

  const livreurNomSelectionne = () => livreurs.find(l => l.id === livreurSelectionne)?.nom ?? livreurSelectionne;
  const peutValider = livreurSelectionne && vehiculeSelectionne;
  const tourneeVerrouillee = detail?.statut === 'LANCEE';

  // Dépassement non accepté = dépassement détecté ET pas encore forcé ET panneau pas ouvert
  const depassementNonForce = compatibilite?.resultat === 'DEPASSEMENT' && !depassementForce;
  const peutLancer = peutValider && !depassementNonForce;

  // ─── Rendu ──────────────────────────────────────────────────────────────────

  if (loading) return <div data-testid="chargement-detail">Chargement...</div>;
  if (erreur && !detail) return <div data-testid="erreur-detail" style={{ color: '#842029' }}>{erreur}</div>;
  if (!detail) return null;

  return (
    <div data-testid="detail-tournee-planifiee-page" style={{ fontFamily: 'sans-serif', padding: 16, maxWidth: 900 }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button onClick={onRetour} data-testid="btn-retour" style={btnSecondaire}>
          {'< Plan du jour'}
        </button>
        <h2 style={{ margin: 0, fontSize: 18 }}>
          Tournée {detail.codeTms} —{' '}
          <span style={{ color: detail.statut === 'NON_AFFECTEE' ? '#dc3545' : detail.statut === 'AFFECTEE' ? '#198754' : '#0d6efd' }}>
            {detail.statut === 'NON_AFFECTEE' ? 'Non affectée' : detail.statut === 'AFFECTEE' ? 'Affectée' : 'Lancée'}
          </span>
          {detail.anomalies.length > 0 && (
            <span data-testid="indicateur-anomalie" style={{ marginLeft: 10, color: '#856404' }}>⚠ Surcharge</span>
          )}
        </h2>
      </header>

      {/* Méta */}
      <div style={{ background: '#f8f9fa', borderRadius: 4, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#495057' }}>
        Import TMS du {detail.date} à {new Date(detail.importeeLe).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        &nbsp;|&nbsp;{detail.nbColis} colis&nbsp;|&nbsp;{detail.zones.length} zone(s)
        {detail.poidsEstimeKg != null && (
          <>&nbsp;|&nbsp;<strong>Poids estimé : {detail.poidsEstimeKg} kg</strong></>
        )}
      </div>

      {/* Messages */}
      {messageSucces && (
        <div data-testid="message-succes" style={{ background: '#d1e7dd', borderRadius: 4, padding: '8px 12px', marginBottom: 8, color: '#0f5132' }}>
          {messageSucces}
        </div>
      )}
      {erreur && (
        <div data-testid="message-erreur" style={{ background: '#f8d7da', borderRadius: 4, padding: '8px 12px', marginBottom: 8, color: '#842029' }}>
          {erreur}
        </div>
      )}

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #dee2e6', marginBottom: 16 }}>
        <button
          data-testid="onglet-composition"
          onClick={() => setOngletActif('composition')}
          style={{
            ...ongletStyle,
            borderBottom: ongletActif === 'composition' ? '2px solid #0d6efd' : '2px solid transparent',
            color: ongletActif === 'composition' ? '#0d6efd' : '#6c757d',
          }}
        >
          Composition
          {detail.compositionVerifiee && (
            <span data-testid="badge-composition-verifiee" style={{ marginLeft: 6, color: '#198754', fontSize: 11 }}>✓</span>
          )}
        </button>
        <button
          data-testid="onglet-affectation"
          onClick={() => setOngletActif('affectation')}
          style={{
            ...ongletStyle,
            borderBottom: ongletActif === 'affectation' ? '2px solid #0d6efd' : '2px solid transparent',
            color: ongletActif === 'affectation' ? '#0d6efd' : '#6c757d',
          }}
        >
          Affectation
        </button>
      </div>

      {/* Onglet Composition */}
      {ongletActif === 'composition' && (
        <div data-testid="contenu-composition">
          {/* Zones */}
          <section style={{ marginBottom: 16 }}>
            <h3 style={h3Style}>Zones couvertes</h3>
            {detail.zones.map(z => (
              <span key={z.nom} style={{ marginRight: 12, background: '#e9ecef', borderRadius: 4, padding: '3px 8px', fontSize: 13 }}>
                {z.nom} — {z.nbColis} colis
              </span>
            ))}
          </section>

          {/* Contraintes */}
          {detail.contraintes.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <h3 style={h3Style}>Contraintes horaires</h3>
              {detail.contraintes.map(c => (
                <div key={c.libelle} style={{ fontSize: 13, marginBottom: 4 }}>
                  ⚑ {c.libelle} — {c.nbColisAffectes} colis
                </div>
              ))}
            </section>
          )}

          {/* Anomalies */}
          <section data-testid="section-anomalies" style={{ marginBottom: 16 }}>
            <h3 style={h3Style}>Anomalies</h3>
            {detail.anomalies.length === 0 ? (
              <div data-testid="aucune-anomalie" style={{ color: '#198754', fontSize: 13 }}>
                Aucune anomalie détectée ✓
              </div>
            ) : (
              detail.anomalies.map(a => (
                <div
                  key={a.code}
                  data-testid={`anomalie-${a.code}`}
                  style={{
                    background: '#fff3cd', border: '1px solid #ffc107',
                    borderRadius: 4, padding: '10px 12px', marginBottom: 8, fontSize: 13
                  }}
                >
                  <strong>⚠ {a.code}</strong> — {a.description}
                </div>
              ))
            )}
          </section>

          {/* Bouton Valider vérification */}
          {!tourneeVerrouillee && (
            <button
              data-testid="btn-valider-composition"
              onClick={validerComposition}
              disabled={actionEnCours || detail.compositionVerifiee}
              style={{
                ...btnPrimaire,
                opacity: detail.compositionVerifiee ? 0.6 : 1,
              }}
            >
              {detail.compositionVerifiee ? 'Composition déjà vérifiée ✓' : 'Valider la vérification'}
            </button>
          )}

          {/* Bouton export CSV — US-038 : libellé "Télécharger la liste" */}
          <button
            data-testid="btn-telecharger-liste"
            onClick={telechargerListeCSV}
            style={{ ...btnSecondaire, marginTop: 12 }}
          >
            Télécharger la liste
          </button>
        </div>
      )}

      {/* Onglet Affectation */}
      {ongletActif === 'affectation' && (
        <div data-testid="contenu-affectation">
          {tourneeVerrouillee ? (
            <div data-testid="tournee-lancee-readonly" style={{ color: '#6c757d', fontSize: 14 }}>
              Tournée lancée à {detail.lancee ? new Date(detail.lancee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--'}
              &nbsp;— {detail.livreurNom} / {detail.vehiculeId}
            </div>
          ) : (
            <>
              {/* Sélecteur Livreur */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 14 }}>
                  Livreur
                </label>
                <select
                  data-testid="select-livreur"
                  value={livreurSelectionne}
                  onChange={e => setLivreurSelectionne(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Sélectionner un livreur disponible...</option>
                  {livreurs.map(l => (
                    <option key={l.id} value={l.id} disabled={!l.disponible}>
                      {l.nom}{!l.disponible ? ` — Indisponible (${l.tourneeAffectee ?? 'déjà affecté'})` : ''}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                  Livreurs disponibles : {livreurs.filter(l => l.disponible).map(l => l.nom).join(', ') || 'Aucun'}
                  &nbsp;({livreurs.filter(l => l.disponible).length}/{livreurs.length})
                </div>
              </div>

              {/* Sélecteur Véhicule */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6, fontSize: 14 }}>
                  Véhicule
                  {detail.poidsEstimeKg != null && (
                    <span style={{ fontWeight: 'normal', fontSize: 12, color: '#6c757d', marginLeft: 8 }}>
                      (charge estimée : {detail.poidsEstimeKg} kg)
                    </span>
                  )}
                </label>
                <select
                  data-testid="select-vehicule"
                  value={vehiculeSelectionne}
                  onChange={e => setVehiculeSelectionne(e.target.value)}
                  style={selectStyle}
                  disabled={!livreurSelectionne}
                >
                  <option value="">Sélectionner un véhicule disponible...</option>
                  {vehicules.map(v => (
                    <option key={v.id} value={v.id} disabled={!v.disponible}>
                      {v.id}{v.capaciteKg != null ? ` (${v.capaciteKg} kg)` : ''}{!v.disponible ? ` — Indisponible (${v.tourneeAffectee ?? 'déjà affecté'})` : ''}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#6c757d', marginTop: 4 }}>
                  Véhicules disponibles : {vehicules.filter(v => v.disponible).map(v => v.id).join(', ') || 'Aucun'}
                  &nbsp;({vehicules.filter(v => v.disponible).length}/{vehicules.length})
                </div>
              </div>

              {/* ─── Indicateur de compatibilité véhicule (US-030) ─── */}
              {compatibilite && (
                <div
                  data-testid={`indicateur-compatibilite-${compatibilite.resultat}`}
                  style={{
                    borderRadius: 4,
                    padding: '10px 14px',
                    marginBottom: 12,
                    fontSize: 13,
                    background: compatibilite.resultat === 'COMPATIBLE' ? '#d1e7dd' : '#f8d7da',
                    border: `1px solid ${compatibilite.resultat === 'COMPATIBLE' ? '#badbcc' : '#f5c2c7'}`,
                    color: compatibilite.resultat === 'COMPATIBLE' ? '#0f5132' : '#842029',
                  }}
                >
                  {compatibilite.resultat === 'COMPATIBLE' && (
                    <span>Véhicule compatible — marge {compatibilite.margeOuDepassementKg} kg</span>
                  )}

                  {compatibilite.resultat === 'DEPASSEMENT' && !depassementForce && (
                    <div>
                      <strong>Chargement trop lourd</strong> — {compatibilite.message}

                      {/* ─── Lien réaffectation (US-034 SC1) ─── */}
                      <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button
                          data-testid="btn-reaffecter-vehicule-plus-grand"
                          onClick={ouvrirPanneauReaffectation}
                          style={{ ...btnPrimaire, fontSize: 13, padding: '6px 12px' }}
                        >
                          Réaffecter à un véhicule plus grand
                        </button>
                        <button
                          data-testid="btn-affecter-quand-meme"
                          onClick={forcerAffectationMalgreDepassement}
                          disabled={actionEnCours}
                          style={{ ...btnSecondaireOrange, fontSize: 13, padding: '6px 12px' }}
                        >
                          Affecter quand même
                        </button>
                      </div>
                    </div>
                  )}

                  {compatibilite.resultat === 'DEPASSEMENT' && depassementForce && (
                    <span>Affectation forcée malgré le dépassement — surveiller la tournée</span>
                  )}
                </div>
              )}

              {/* ─── Panneau de réaffectation (US-034 SC2/SC3/SC4) ─── */}
              {panneauReaffectationOuvert && (
                <div
                  data-testid="panneau-reaffectation"
                  style={{
                    border: '1px solid #0d6efd',
                    borderRadius: 6,
                    padding: 16,
                    marginBottom: 16,
                    background: '#f0f4ff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <strong style={{ fontSize: 14 }}>
                      Véhicules compatibles (capacité ≥ {compatibilite?.poidsEstimeKg ?? detail.poidsEstimeKg} kg)
                    </strong>
                    <button
                      data-testid="btn-fermer-panneau-reaffectation"
                      onClick={() => setPanneauReaffectationOuvert(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6c757d' }}
                    >
                      ×
                    </button>
                  </div>

                  {chargementVehicules && (
                    <div data-testid="chargement-vehicules-compatibles" style={{ fontSize: 13, color: '#6c757d' }}>
                      Recherche en cours...
                    </div>
                  )}

                  {!chargementVehicules && vehiculesCompatibles.length === 0 && (
                    <div data-testid="aucun-vehicule-disponible" style={{ fontSize: 13, color: '#6c757d', fontStyle: 'italic' }}>
                      Aucun véhicule disponible pour cette capacité
                    </div>
                  )}

                  {!chargementVehicules && vehiculesCompatibles.length > 0 && (
                    <ul data-testid="liste-vehicules-compatibles" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {vehiculesCompatibles.map(v => (
                        <li
                          key={v.vehiculeId}
                          data-testid={`vehicule-compatible-${v.vehiculeId}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: 4,
                            marginBottom: 6,
                            background: '#fff',
                            border: '1px solid #dee2e6',
                          }}
                        >
                          <div style={{ fontSize: 13 }}>
                            <strong>{v.vehiculeId}</strong> — {v.capaciteKg} kg — {v.typeVehicule}
                          </div>
                          <button
                            data-testid={`btn-selectionner-vehicule-${v.vehiculeId}`}
                            onClick={() => selectionnerVehiculeCompatible(v.vehiculeId)}
                            disabled={actionEnCours}
                            style={{ ...btnPrimaire, fontSize: 12, padding: '4px 10px' }}
                          >
                            Sélectionner
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Message si sélection incomplète */}
              {!peutValider && (
                <div data-testid="msg-selection-incomplete" style={{ fontSize: 13, color: '#6c757d', marginBottom: 12 }}>
                  Veuillez sélectionner un livreur{!livreurSelectionne ? ' et un véhicule' : ''} pour valider l'affectation.
                </div>
              )}

              {/* Boutons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  data-testid="btn-valider-affectation"
                  onClick={affecterSeulement}
                  disabled={!peutValider || actionEnCours}
                  style={{ ...btnPrimaire, opacity: !peutValider ? 0.5 : 1 }}
                >
                  VALIDER L'AFFECTATION
                </button>

                <button
                  data-testid="btn-valider-et-lancer"
                  onClick={affecterEtLancer}
                  disabled={!peutLancer || actionEnCours}
                  style={{
                    ...btnSucces,
                    opacity: !peutLancer ? 0.5 : 1,
                  }}
                >
                  {detail.anomalies.length > 0 && !depassementNonForce
                    ? 'Lancer malgré l\'anomalie'
                    : 'VALIDER ET LANCER'}
                </button>
              </div>

              {depassementNonForce && (
                <div data-testid="msg-depassement-bloque" style={{ fontSize: 12, color: '#842029', marginTop: 6 }}>
                  Le lancement est bloqué jusqu'à réaffectation ou forçage.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Données mock pour les tests ──────────────────────────────────────────────

const livreursMock: LivreurDisponible[] = [
  { id: 'livreur-001', nom: 'P. Morel',  disponible: false, tourneeAffectee: 'T-202' }, // déjà affecté (seedé)
  { id: 'livreur-002', nom: 'L. Petit',  disponible: false, tourneeAffectee: 'T-204' }, // déjà lancé (seedé)
  { id: 'livreur-003', nom: 'S. Roger',  disponible: true },
  { id: 'livreur-004', nom: 'J. Dubois', disponible: true },
  { id: 'livreur-005', nom: 'C. Leroy',  disponible: true },
];

const vehiculesMock: VehiculeDisponible[] = [
  { id: 'VH-04', disponible: true,  capaciteKg: 700 },
  { id: 'VH-07', disponible: false, tourneeAffectee: 'T-202', capaciteKg: 600 }, // déjà affecté (seedé)
  { id: 'VH-08', disponible: true,  capaciteKg: 800 },
  { id: 'VH-11', disponible: true,  capaciteKg: 700 },
  { id: 'VH-03', disponible: false, tourneeAffectee: 'T-204', capaciteKg: 500 }, // déjà lancé (seedé)
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const ongletStyle: React.CSSProperties = {
  padding: '8px 20px', background: 'none', border: 'none',
  cursor: 'pointer', fontWeight: 'bold', fontSize: 14,
};
const h3Style: React.CSSProperties = { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#495057' };
const btnPrimaire: React.CSSProperties = { background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 14 };
const btnSecondaire: React.CSSProperties = { background: '#6c757d', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 13 };
const btnSecondaireOrange: React.CSSProperties = { background: '#fd7e14', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 14 };
const btnSucces: React.CSSProperties = { background: '#198754', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 14 };
const selectStyle: React.CSSProperties = { width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ced4da', fontSize: 14 };
