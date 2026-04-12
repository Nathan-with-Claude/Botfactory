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
  livreurs,
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

  // Liste effective des livreurs : prop (tests) ou fetch API (production)
  const [livreursEffectifs, setLivreursEffectifs] = useState<LivreurDisponible[]>(livreurs ?? livreursMock);

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

  // Charge la liste réelle des livreurs depuis l'API quand aucun prop n'est fourni (hors tests)
  useEffect(() => {
    if (livreurs) return; // prop fourni (tests) → ne pas écraser
    fetchFn(`${apiBaseUrl}/api/supervision/livreurs/etat-du-jour`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: { livreurId: string; nomComplet: string; etat: string; codeTms?: string }[]) => {
        setLivreursEffectifs(data.map(l => ({
          id: l.livreurId,
          nom: l.nomComplet,
          disponible: l.etat === 'SANS_TOURNEE',
          tourneeAffectee: l.etat !== 'SANS_TOURNEE' ? (l.codeTms ?? undefined) : undefined,
        })));
      })
      .catch(() => { /* garde le mock en cas d'échec */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl, fetchFn]);

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
      const livreurObj = livreursEffectifs.find(l => l.id === livreurSelectionne);
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

  const livreurNomSelectionne = () => livreursEffectifs.find(l => l.id === livreurSelectionne)?.nom ?? livreurSelectionne;
  // Un livreur est valide si : disponible OU déjà affecté à cette tournée (réaffectation)
  const livreurSelectionneValide = !livreurSelectionne ||
    (livreursEffectifs.find(l => l.id === livreurSelectionne)?.disponible !== false) ||
    livreurSelectionne === detail?.livreurId;
  const peutValider = !!livreurSelectionne && !!vehiculeSelectionne && livreurSelectionneValide;
  const tourneeVerrouillee = detail?.statut === 'LANCEE';

  // ─── Désaffectation (US-050) ─────────────────────────────────────────────────

  const desaffecterTournee = async () => {
    if (!detail) return;
    const msg = `Désaffecter ${detail.livreurNom} de la tournée ${detail.codeTms} ?`;
    if (!window.confirm(msg)) return;
    setActionEnCours(true);
    setErreur(null);
    try {
      const res = await fetchFn(
        `${apiBaseUrl}/api/planification/tournees/${tourneePlanifieeId}/affectation`,
        { method: 'DELETE' }
      );
      if (res.status === 409) {
        setErreur('Impossible de désaffecter un livreur d\'une tournée en cours. Clôturez d\'abord la tournée depuis l\'application mobile.');
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMessageSucces(`Livreur désaffecté de la tournée ${detail.codeTms}.`);
      setTimeout(() => setMessageSucces(null), 3000);
      setLivreurSelectionne('');
      setVehiculeSelectionne('');
      chargerDetail();
    } catch (err) {
      if (!erreur) {
        setErreur('Erreur réseau lors de la désaffectation.');
      }
    } finally {
      setActionEnCours(false);
    }
  };

  // Dépassement non accepté = dépassement détecté ET pas encore forcé ET panneau pas ouvert
  const depassementNonForce = compatibilite?.resultat === 'DEPASSEMENT' && !depassementForce;
  const peutLancer = peutValider && !depassementNonForce;

  // ─── Helpers couleur statut ───────────────────────────────────────────────

  const statutLabel = (statut: string) => {
    if (statut === 'NON_AFFECTEE') return 'Non affectée';
    if (statut === 'AFFECTEE') return 'Affectée';
    return 'Lancée';
  };

  const statutColorClass = (statut: string) => {
    if (statut === 'NON_AFFECTEE') return 'text-error';
    if (statut === 'AFFECTEE') return 'text-emerald-600';
    return 'text-primary';
  };

  // ─── Rendu ──────────────────────────────────────────────────────────────────

  if (loading) return <div data-testid="chargement-detail">Chargement...</div>;
  if (erreur && !detail) return <div data-testid="erreur-detail" className="text-error">{erreur}</div>;
  if (!detail) return null;

  return (
    <div data-testid="detail-tournee-planifiee-page" className="font-body p-4 max-w-3xl mx-auto">

      {/* Header */}
      <header className="flex items-center gap-3 mb-3">
        <button
          onClick={onRetour}
          data-testid="btn-retour"
          className="flex items-center gap-1 px-3 py-1.5 bg-surface-container text-on-surface-variant border border-outline-variant/30 rounded-md text-sm font-medium hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-base leading-none">arrow_back</span>
          Plan du jour
        </button>
        <h2 className="m-0 text-lg font-bold text-on-surface">
          Tournée {detail.codeTms}{' '}
          <span className={`font-semibold ${statutColorClass(detail.statut)}`}>
            — {statutLabel(detail.statut)}
          </span>
          {detail.anomalies.length > 0 && (
            <span
              data-testid="indicateur-anomalie"
              className="ml-2 text-sm font-medium text-amber-700"
            >
              ⚠ Surcharge
            </span>
          )}
        </h2>
      </header>

      {/* Méta */}
      <div className="bg-surface-container-low rounded-xl px-4 py-2.5 mb-3 text-sm text-on-surface-variant border border-outline-variant/10">
        Import TMS du {detail.date} à {new Date(detail.importeeLe).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        &nbsp;|&nbsp;{detail.nbColis} colis&nbsp;|&nbsp;{detail.zones.length} zone(s)
        {detail.poidsEstimeKg != null && (
          <>&nbsp;|&nbsp;<strong className="font-semibold text-on-surface">Poids estimé : {detail.poidsEstimeKg} kg</strong></>
        )}
      </div>

      {/* Messages */}
      {messageSucces && (
        <div data-testid="message-succes" className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2.5 mb-2 text-sm">
          {messageSucces}
        </div>
      )}
      {erreur && (
        <div data-testid="message-erreur" className="bg-error-container/40 border border-error/10 text-on-error-container rounded-xl px-4 py-2.5 mb-2 text-sm">
          {erreur}
        </div>
      )}

      {/* Onglets */}
      <div className="flex items-center gap-8 border-b border-outline-variant/15 mb-6">
        <button
          data-testid="onglet-composition"
          onClick={() => setOngletActif('composition')}
          className={`px-4 py-4 text-sm flex items-center gap-2 border-b-2 transition-colors ${
            ongletActif === 'composition'
              ? 'font-bold text-primary border-primary'
              : 'font-medium text-on-surface-variant hover:text-primary border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-base leading-none">inventory_2</span>
          Composition
          {detail.compositionVerifiee && (
            <span data-testid="badge-composition-verifiee" className="ml-1 text-emerald-600 text-xs font-bold">✓</span>
          )}
        </button>
        <button
          data-testid="onglet-affectation"
          onClick={() => setOngletActif('affectation')}
          className={`px-4 py-4 text-sm flex items-center gap-2 border-b-2 transition-colors ${
            ongletActif === 'affectation'
              ? 'font-bold text-primary border-primary'
              : 'font-medium text-on-surface-variant hover:text-primary border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-base leading-none">person_pin</span>
          Affectation
        </button>
      </div>

      {/* Onglet Composition */}
      {ongletActif === 'composition' && (
        <div data-testid="contenu-composition">
          {/* Zones */}
          <section className="mb-4">
            <h3 className="text-sm font-bold text-on-surface-variant mb-2">Zones couvertes</h3>
            <div className="flex flex-wrap gap-2">
              {detail.zones.map(z => (
                <span
                  key={z.nom}
                  className="bg-surface-container rounded-md px-3 py-1 text-sm text-on-surface border border-outline-variant/20"
                >
                  {z.nom} — {z.nbColis} colis
                </span>
              ))}
            </div>
          </section>

          {/* Contraintes */}
          {detail.contraintes.length > 0 && (
            <section className="mb-4">
              <h3 className="text-sm font-bold text-on-surface-variant mb-2">Contraintes horaires</h3>
              {detail.contraintes.map(c => (
                <div key={c.libelle} className="text-sm text-on-surface mb-1">
                  ⚑ {c.libelle} — {c.nbColisAffectes} colis
                </div>
              ))}
            </section>
          )}

          {/* Anomalies */}
          <section data-testid="section-anomalies" className="mb-4">
            <h3 className="text-sm font-bold text-on-surface-variant mb-2">Anomalies</h3>
            {detail.anomalies.length === 0 ? (
              <div data-testid="aucune-anomalie" className="text-emerald-600 text-sm">
                Aucune anomalie détectée ✓
              </div>
            ) : (
              detail.anomalies.map(a => (
                <div
                  key={a.code}
                  data-testid={`anomalie-${a.code}`}
                  className="bg-tertiary-fixed/20 border border-tertiary/10 rounded-xl p-5 mb-2 flex gap-4 items-start"
                >
                  <div className="bg-tertiary/10 p-2 rounded-lg text-tertiary flex-shrink-0">
                    <span className="material-symbols-outlined text-base leading-none">error</span>
                  </div>
                  <div className="text-sm text-on-surface">
                    <strong className="font-semibold">⚠ {a.code}</strong> — {a.description}
                  </div>
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
              className={`px-5 py-2.5 bg-primary text-on-primary rounded-md font-semibold text-sm shadow-sm flex items-center gap-2 hover:opacity-90 ${
                detail.compositionVerifiee ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span className="material-symbols-outlined text-base leading-none">check_circle</span>
              {detail.compositionVerifiee ? 'Composition déjà vérifiée ✓' : 'Valider la vérification'}
            </button>
          )}

          {/* Bouton export CSV — US-038 : libellé "Télécharger la liste" */}
          <button
            data-testid="btn-telecharger-liste"
            onClick={telechargerListeCSV}
            className="mt-3 px-5 py-2 bg-surface-container text-on-surface border border-outline-variant/30 rounded-md font-medium text-sm hover:bg-surface-container-high transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base leading-none">download</span>
            Télécharger la liste
          </button>
        </div>
      )}

      {/* Onglet Affectation */}
      {ongletActif === 'affectation' && (
        <div data-testid="contenu-affectation">
          {tourneeVerrouillee ? (
            <div data-testid="tournee-lancee-readonly" className="text-on-surface-variant text-sm">
              <p className="mb-2">
                Tournée lancée à {detail.lancee ? new Date(detail.lancee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--'}
                &nbsp;— {detail.livreurNom} / {detail.vehiculeId}
              </p>
              <p data-testid="msg-tournee-en-cours" className="text-error text-sm">
                Impossible de désaffecter un livreur d&apos;une tournée en cours. Clôturez d&apos;abord la tournée depuis l&apos;application mobile.
              </p>
            </div>
          ) : (
            <>
              {/* Bouton Désaffecter — US-050 (visible si AFFECTEE) */}
              {detail.statut === 'AFFECTEE' && (
                <div
                  data-testid="section-desaffectation"
                  className="mb-4 px-4 py-3 bg-[#fff3e0] border border-orange-200 rounded-xl flex items-center gap-4"
                >
                  <span className="text-sm text-amber-900">
                    Livreur affecté : <strong className="font-semibold">{detail.livreurNom}</strong> / {detail.vehiculeId}
                  </span>
                  <button
                    data-testid="btn-desaffecter"
                    onClick={desaffecterTournee}
                    disabled={actionEnCours}
                    className="px-4 py-2 bg-error/10 text-error border border-error/20 rounded-md font-semibold text-sm hover:bg-error hover:text-on-error transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Désaffecter
                  </button>
                </div>
              )}

              {/* Sélecteurs dans un conteneur card */}
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 mb-4">
                {/* Sélecteur Livreur */}
                <div className="mb-5">
                  <label className="text-[10px] font-bold text-outline uppercase mb-1.5 block tracking-wide">
                    Livreur
                  </label>
                  <div className="relative">
                    <select
                      data-testid="select-livreur"
                      value={livreurSelectionne}
                      onChange={e => setLivreurSelectionne(e.target.value)}
                      className="w-full bg-white border border-outline-variant/50 rounded-lg py-2.5 px-4 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-on-surface"
                    >
                      <option value="">Sélectionner un livreur disponible...</option>
                      {livreursEffectifs.map(l => {
                        const estLivreurActuel = l.id === detail?.livreurId;
                        const estDesactive = !l.disponible && !estLivreurActuel;
                        return (
                          <option key={l.id} value={l.id} disabled={estDesactive}>
                            {l.nom}{estDesactive ? ` — Déjà affecté (${l.tourneeAffectee ?? 'autre tournée'})` : ''}
                          </option>
                        );
                      })}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">expand_more</span>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-1">
                    Livreurs disponibles : {livreursEffectifs.filter(l => l.disponible).map(l => l.nom).join(', ') || 'Aucun'}
                    &nbsp;({livreursEffectifs.filter(l => l.disponible).length}/{livreursEffectifs.length})
                  </div>
                </div>

                {/* Sélecteur Véhicule */}
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase mb-1.5 block tracking-wide">
                    Véhicule
                    {detail.poidsEstimeKg != null && (
                      <span className="normal-case font-normal text-on-surface-variant ml-2 text-[10px]">
                        (charge estimée : {detail.poidsEstimeKg} kg)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <select
                      data-testid="select-vehicule"
                      value={vehiculeSelectionne}
                      onChange={e => setVehiculeSelectionne(e.target.value)}
                      disabled={!livreurSelectionne}
                      className="w-full bg-white border border-outline-variant/50 rounded-lg py-2.5 px-4 text-sm appearance-none focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer text-on-surface disabled:bg-surface-container disabled:cursor-not-allowed"
                    >
                      <option value="">Sélectionner un véhicule disponible...</option>
                      {vehicules.map(v => (
                        <option key={v.id} value={v.id} disabled={!v.disponible}>
                          {v.id}{v.capaciteKg != null ? ` (${v.capaciteKg} kg)` : ''}{!v.disponible ? ` — Indisponible (${v.tourneeAffectee ?? 'déjà affecté'})` : ''}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">expand_more</span>
                  </div>
                  <div className="text-xs text-on-surface-variant mt-1">
                    Véhicules disponibles : {vehicules.filter(v => v.disponible).map(v => v.id).join(', ') || 'Aucun'}
                    &nbsp;({vehicules.filter(v => v.disponible).length}/{vehicules.length})
                  </div>
                </div>
              </div>

              {/* ─── Indicateur de compatibilité véhicule (US-030) ─── */}
              {compatibilite && (
                <div
                  data-testid={`indicateur-compatibilite-${compatibilite.resultat}`}
                  className={`rounded-xl p-4 mb-4 text-sm ${
                    compatibilite.resultat === 'COMPATIBLE'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3'
                      : 'bg-error-container/40 border border-error/10'
                  }`}
                >
                  {compatibilite.resultat === 'COMPATIBLE' && (
                    <>
                      <span className="material-symbols-outlined text-emerald-600 text-base leading-none">check_circle</span>
                      <span>Véhicule compatible — marge {compatibilite.margeOuDepassementKg} kg</span>
                    </>
                  )}

                  {compatibilite.resultat === 'DEPASSEMENT' && !depassementForce && (
                    <div>
                      <p className="font-semibold text-error mb-1">Chargement trop lourd</p>
                      <p className="text-on-surface-variant text-xs mb-3">{compatibilite.message}</p>

                      {/* ─── Lien réaffectation (US-034 SC1) ─── */}
                      <div className="flex gap-2 items-center flex-wrap">
                        <button
                          data-testid="btn-reaffecter-vehicule-plus-grand"
                          onClick={ouvrirPanneauReaffectation}
                          className="px-4 py-2 bg-primary text-on-primary rounded-md font-semibold text-sm hover:opacity-90 shadow-sm flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base leading-none">swap_horiz</span>
                          Réaffecter à un véhicule plus grand
                        </button>
                        <button
                          data-testid="btn-affecter-quand-meme"
                          onClick={forcerAffectationMalgreDepassement}
                          disabled={actionEnCours}
                          className="px-4 py-2 bg-[#fff3e0] text-amber-900 border border-orange-300 rounded-md font-semibold text-sm hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Affecter quand même
                        </button>
                      </div>
                    </div>
                  )}

                  {compatibilite.resultat === 'DEPASSEMENT' && depassementForce && (
                    <span className="text-amber-800">Affectation forcée malgré le dépassement — surveiller la tournée</span>
                  )}
                </div>
              )}

              {/* ─── Panneau de réaffectation (US-034 SC2/SC3/SC4) ─── */}
              {panneauReaffectationOuvert && (
                <div
                  data-testid="panneau-reaffectation"
                  className="border border-primary/30 rounded-xl p-4 mb-4 bg-primary-fixed/10"
                >
                  <div className="flex justify-between items-center mb-3">
                    <strong className="text-sm font-semibold text-on-surface">
                      Véhicules compatibles (capacité ≥ {compatibilite?.poidsEstimeKg ?? detail.poidsEstimeKg} kg)
                    </strong>
                    <button
                      data-testid="btn-fermer-panneau-reaffectation"
                      onClick={() => setPanneauReaffectationOuvert(false)}
                      className="bg-transparent border-none cursor-pointer text-lg text-on-surface-variant hover:text-on-surface transition-colors p-1 leading-none"
                    >
                      ×
                    </button>
                  </div>

                  {chargementVehicules && (
                    <div data-testid="chargement-vehicules-compatibles" className="text-sm text-on-surface-variant">
                      Recherche en cours...
                    </div>
                  )}

                  {!chargementVehicules && vehiculesCompatibles.length === 0 && (
                    <div data-testid="aucun-vehicule-disponible" className="text-sm text-on-surface-variant italic">
                      Aucun véhicule disponible pour cette capacité
                    </div>
                  )}

                  {!chargementVehicules && vehiculesCompatibles.length > 0 && (
                    <ul data-testid="liste-vehicules-compatibles" className="list-none p-0 m-0 space-y-1.5">
                      {vehiculesCompatibles.map(v => (
                        <li
                          key={v.vehiculeId}
                          data-testid={`vehicule-compatible-${v.vehiculeId}`}
                          className="flex justify-between items-center px-3 py-2 rounded-lg bg-white border border-outline-variant/20"
                        >
                          <div className="text-sm text-on-surface">
                            <strong className="font-semibold">{v.vehiculeId}</strong> — {v.capaciteKg} kg — {v.typeVehicule}
                          </div>
                          <button
                            data-testid={`btn-selectionner-vehicule-${v.vehiculeId}`}
                            onClick={() => selectionnerVehiculeCompatible(v.vehiculeId)}
                            disabled={actionEnCours}
                            className="px-3 py-1.5 bg-primary text-on-primary rounded-md font-semibold text-xs hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sélectionner
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Message si sélection incomplète ou livreur indisponible */}
              {!peutValider && (
                <div data-testid="msg-selection-incomplete" className="text-sm text-on-surface-variant mb-3">
                  {livreurSelectionne && !livreurSelectionneValide
                    ? `Ce livreur est déjà affecté à une autre tournée. Veuillez en sélectionner un autre.`
                    : `Veuillez sélectionner un livreur${!livreurSelectionne ? ' et un véhicule' : ''} pour valider l'affectation.`
                  }
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  data-testid="btn-valider-affectation"
                  onClick={affecterSeulement}
                  disabled={!peutValider || actionEnCours}
                  className={`px-5 py-2.5 bg-surface-container text-on-surface border border-outline-variant/30 rounded-md font-semibold text-sm hover:bg-surface-container-high transition-colors flex items-center gap-2 ${!peutValider ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  VALIDER L'AFFECTATION
                </button>

                <button
                  data-testid="btn-valider-et-lancer"
                  onClick={affecterEtLancer}
                  disabled={!peutLancer || actionEnCours}
                  className={`px-5 py-2.5 bg-primary text-on-primary rounded-md font-semibold text-sm hover:opacity-90 shadow-sm flex items-center gap-2 ${!peutLancer ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="material-symbols-outlined text-base leading-none">play_arrow</span>
                  {detail.anomalies.length > 0 && !depassementNonForce
                    ? 'Lancer malgré l\'anomalie'
                    : 'VALIDER ET LANCER'}
                </button>
              </div>

              {depassementNonForce && (
                <div data-testid="msg-depassement-bloque" className="text-xs text-error mt-1.5">
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

// 6 livreurs canoniques alignés avec devLivreurs.ts (mobile) et DevDataSeeder.java (svc-supervision)
// Règle : disponible:false = livreur affecté à une TourneePlanifiee AFFECTEE ou LANCEE ce jour
//   - T-202 : Jean Moreau AFFECTEE (VH-04)
//   - T-204 : Paul Dupont LANCEE (VH-03)
//   - T-205 : Sophie Bernard AFFECTEE
//   - T-206 : Lucas Petit AFFECTEE
//   - Pierre Martin : EN_COURS dans BC-03 (VueTournee T-201), pas de TourneePlanifiee active → disponible
const livreursMock: LivreurDisponible[] = [
  { id: 'livreur-001', nom: 'Pierre Martin',  disponible: true },
  { id: 'livreur-002', nom: 'Paul Dupont',    disponible: false, tourneeAffectee: 'T-204' },   // LANCEE
  { id: 'livreur-003', nom: 'Marie Lambert',  disponible: true },
  { id: 'livreur-004', nom: 'Jean Moreau',    disponible: false, tourneeAffectee: 'T-202' },   // AFFECTEE
  { id: 'livreur-005', nom: 'Sophie Bernard', disponible: false, tourneeAffectee: 'T-205' },   // AFFECTEE
  { id: 'livreur-006', nom: 'Lucas Petit',    disponible: false, tourneeAffectee: 'T-206' },   // AFFECTEE
];

const vehiculesMock: VehiculeDisponible[] = [
  { id: 'VH-04', disponible: false, tourneeAffectee: 'T-202', capaciteKg: 700 }, // affecté à Jean Moreau (T-202)
  { id: 'VH-07', disponible: true,  capaciteKg: 600 },
  { id: 'VH-08', disponible: true,  capaciteKg: 800 },
  { id: 'VH-11', disponible: true,  capaciteKg: 700 },
  { id: 'VH-03', disponible: false, tourneeAffectee: 'T-204', capaciteKg: 500 }, // lancé avec Paul Dupont (T-204)
];
