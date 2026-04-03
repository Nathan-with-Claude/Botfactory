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

// ─── Badge Statut — classes Tailwind ─────────────────────────────────────────

function badgeStatutClasses(statut: StatutAffectation): { label: string; classes: string } {
  const base = 'text-[0.6875rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter';
  switch (statut) {
    case 'NON_AFFECTEE':
      return { label: 'NON AFFECTÉE', classes: `${base} bg-error-container text-on-error-container` };
    case 'AFFECTEE':
      return { label: 'AFFECTÉE',     classes: `${base} bg-primary-container text-on-primary-container` };
    case 'LANCEE':
      return { label: 'LANCÉE',       classes: `${base} bg-secondary-container text-on-secondary-container` };
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
 * Refactorisé avec Tailwind CSS + design system DocuPost (US-027).
 * Toute la logique métier est conservée (hooks, state, appels API, data-testid).
 *
 * Source : US-021, US-024, US-027
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

  const filtresConfig = [
    { key: 'TOUTES' as const,       label: 'Toutes' },
    { key: 'NON_AFFECTEE' as const, label: 'Non affectées' },
    { key: 'AFFECTEE' as const,     label: 'Affectées' },
    { key: 'LANCEE' as const,       label: 'Lancées' },
  ];

  return (
    <div data-testid="preparation-page" className="font-body text-on-surface antialiased">

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-outline font-medium">
        <span>Logistique</span>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-on-surface font-semibold">Plan du jour</span>
      </nav>

      {/* Bandeau résumé + alerte non affectées */}
      {plan && (
        <div
          data-testid="bandeau-resume"
          className="mb-8 p-5 rounded-xl bg-tertiary-fixed flex flex-wrap items-center justify-between gap-4 border-l-[6px] border-tertiary shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-6">
            {/* Alerte si tournées non affectées */}
            {plan.nonAffectees > 0 && (
              <div className="flex flex-col">
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-on-tertiary-fixed-variant">
                  Alerte Préparation
                </span>
                <span className="text-sm font-semibold text-on-tertiary-fixed">
                  Il reste {plan.nonAffectees} tournée{plan.nonAffectees > 1 ? 's' : ''} non affectée{plan.nonAffectees > 1 ? 's' : ''} à un livreur.
                </span>
              </div>
            )}

            {/* Séparateur */}
            {plan.nonAffectees > 0 && (
              <div className="h-10 w-px bg-tertiary-fixed-dim opacity-30 hidden md:block" />
            )}

            {/* Compteurs pills */}
            <div className="flex flex-wrap gap-2">
              <div className="bg-surface-container-lowest px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="text-xs font-bold text-outline">Toutes</span>
                <span
                  className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold"
                  data-testid="total-tournees"
                >
                  {plan.totalTournees}
                </span>
              </div>
              <div className="bg-error-container px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="text-xs font-bold text-on-error-container">Non affectées</span>
                <span className="bg-error text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {plan.nonAffectees}
                </span>
              </div>
              <div className="bg-secondary-container px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="text-xs font-bold text-on-secondary-container">Affectées</span>
                <span className="bg-secondary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {plan.affectees}
                </span>
              </div>
              <div className="bg-primary-fixed-dim px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="text-xs font-bold text-on-primary-fixed">Lancées</span>
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {plan.lancees}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {/* Rafraîchir depuis TMS */}
            <button
              data-testid="bouton-forcer-import"
              onClick={forcerImportTms}
              disabled={importEnCours}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest text-primary font-bold text-sm rounded-md shadow-sm border border-outline-variant/15 hover:bg-primary-fixed transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              {importEnCours ? 'Import en cours…' : 'Rafraîchir depuis TMS'}
            </button>

            {/* Lancer toutes — disabled si non-affectées restantes */}
            {plan.lancees === plan.totalTournees && plan.totalTournees > 0 ? (
              <span
                data-testid="toutes-lancees-banniere"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-on-tertiary-fixed-variant"
              >
                Toutes les tournées ont été lancées.
              </span>
            ) : (
              <button
                data-testid="btn-lancer-toutes"
                onClick={lancerToutes}
                disabled={plan.nonAffectees > 0}
                className={
                  plan.nonAffectees > 0
                    ? 'flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-400 font-bold text-sm rounded-md cursor-not-allowed'
                    : 'flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-sm rounded-md shadow-sm hover:bg-primary-container transition-all'
                }
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Lancer toutes les tournées
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {messageSucces && (
        <div
          data-testid="message-succes"
          className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium"
        >
          {messageSucces}
        </div>
      )}
      {erreur && (
        <div
          data-testid="message-erreur"
          className="mb-4 p-3 rounded-lg bg-error-container border border-error/20 text-on-error-container text-sm font-medium"
        >
          {erreur}
        </div>
      )}

      {/* Filtres + Recherche */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div
          data-testid="filtres-statut"
          className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg"
        >
          {filtresConfig.map(({ key, label }) => (
            <button
              key={key}
              data-testid={`filtre-${key}`}
              onClick={() => setFiltre(key)}
              className={
                filtre === key
                  ? 'px-5 py-2 text-sm font-semibold rounded-md bg-white shadow-sm text-primary'
                  : 'px-5 py-2 text-sm font-medium text-outline hover:text-on-surface transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-outline"
            placeholder="Rechercher une tournée..."
          />
        </div>
      </div>

      {/* Tableau / États de chargement */}
      {loading ? (
        <div data-testid="chargement" className="py-12 text-center text-outline text-sm">
          Chargement du plan du jour...
        </div>
      ) : !plan || plan.tournees.length === 0 ? (
        <div
          data-testid="aucune-tournee"
          className="py-12 text-center text-outline text-sm flex flex-col items-center gap-4"
        >
          <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
          <span>Aucune tournée importée pour aujourd'hui.</span>
          <button
            data-testid="bouton-forcer-import"
            onClick={forcerImportTms}
            disabled={importEnCours}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-sm rounded-md shadow-sm hover:bg-primary-container transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            {importEnCours ? 'Import en cours…' : "Forcer l'import TMS"}
          </button>
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table
              data-testid="tableau-tournees"
              className="w-full border-collapse text-left"
            >
              <thead>
                <tr className="text-[0.6875rem] font-bold uppercase tracking-wider text-outline border-b border-outline-variant/10">
                  <th className="py-4 px-6">Code TMS</th>
                  <th className="py-4 px-6">Colis</th>
                  <th className="py-4 px-6">Zones</th>
                  <th className="py-4 px-6" data-testid="colonne-poids-entete">Poids</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6">Livreur / Véhicule</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {plan.tournees.map((tournee) => {
                  const badge = badgeStatutClasses(tournee.statut);
                  const surcharge = tournee.aDesAnomalies;
                  const estLancee = tournee.statut === 'LANCEE';

                  return (
                    <tr
                      key={tournee.id}
                      data-testid={`ligne-tournee-${tournee.id}`}
                      className={[
                        'group hover:bg-surface-container-high transition-colors',
                        surcharge
                          ? 'bg-tertiary-fixed/20 border-l-4 border-tertiary'
                          : estLancee
                            ? 'bg-white/60 opacity-60'
                            : 'bg-white',
                      ].join(' ')}
                    >
                      {/* Code TMS */}
                      <td className="py-5 px-6 font-headline font-bold text-on-surface">
                        <div className="flex items-center gap-2">
                          {tournee.codeTms}
                          {surcharge && (
                            <span
                              data-testid={`anomalie-${tournee.id}`}
                              className="material-symbols-outlined text-tertiary text-lg"
                              title="Anomalie de charge"
                            >
                              warning
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Nb colis */}
                      <td className="py-5 px-6 text-slate-600">
                        {tournee.nbColis} colis
                      </td>

                      {/* Zones */}
                      <td className="py-5 px-6 text-slate-600">
                        {tournee.zones.slice(0, 2).map((z) => (
                          <div key={z.nom} className="text-xs">{z.nom}</div>
                        ))}
                      </td>

                      {/* US-041 — Poids */}
                      <td className="py-5 px-6 text-slate-600" data-testid={`poids-${tournee.id}`}>
                        {tournee.poidsEstimeKg != null ? (
                          <span className="flex items-center gap-1">
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
                                  className={
                                    niveau === 'CRITIQUE'
                                      ? 'font-bold text-on-error-container cursor-help'
                                      : 'font-bold text-on-tertiary-fixed-variant cursor-help'
                                  }
                                >
                                  {niveau === 'CRITIQUE' ? '⛔' : '⚠'}
                                </span>
                              );
                            })()}
                          </span>
                        ) : (
                          <span className="text-outline text-xs">—</span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="py-5 px-6">
                        <span
                          data-testid={`badge-statut-${tournee.id}`}
                          className={badge.classes}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Livreur / Véhicule */}
                      <td className="py-5 px-6">
                        {tournee.livreurNom ? (
                          <div className="flex items-center gap-2">
                            <span className="text-on-surface font-semibold">{tournee.livreurNom}</span>
                            {tournee.vehiculeId && (
                              <span className="text-xs text-outline">{tournee.vehiculeId}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-outline italic">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-right space-x-4">
                        {/* Voir détail — toujours disponible */}
                        <button
                          data-testid={`btn-detail-${tournee.id}`}
                          onClick={() => onVoirDetail?.(tournee.id)}
                          className="text-outline font-medium hover:text-on-surface transition-all"
                        >
                          Voir le détail
                        </button>

                        {/* Affecter — si NON_AFFECTEE */}
                        {tournee.statut === 'NON_AFFECTEE' && (
                          <button
                            data-testid={`btn-affecter-${tournee.id}`}
                            onClick={() => onAffecter?.(tournee.id)}
                            className="text-primary font-bold hover:underline transition-all"
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
                            className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded shadow-sm hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {lancementEnCours === tournee.id ? 'Lancement...' : 'Lancer →'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 flex flex-col items-center gap-4 bg-surface-container-lowest border-t border-outline-variant/10">
            <button className="px-8 py-2.5 bg-white text-on-surface font-bold text-sm rounded-lg shadow-sm border border-outline-variant/20 hover:bg-slate-50 transition-all flex items-center gap-2">
              Charger plus
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <span className="text-[0.6875rem] font-bold text-outline uppercase tracking-widest">
              Affichage {plan.tournees.length} / {plan.totalTournees} tournées
            </span>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-outline uppercase tracking-widest">Capacité Globale</span>
            <span className="material-symbols-outlined text-primary">local_shipping</span>
          </div>
          <div className="text-3xl font-bold font-headline text-on-surface mb-2">
            {plan ? Math.round((plan.lancees / Math.max(plan.totalTournees, 1)) * 100) : 0}%
          </div>
          <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: plan ? `${Math.round((plan.lancees / Math.max(plan.totalTournees, 1)) * 100)}%` : '0%' }}
            />
          </div>
          <p className="mt-3 text-[10px] font-medium text-outline">
            {plan?.lancees ?? 0} tournées lancées sur {plan?.totalTournees ?? 0}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-outline uppercase tracking-widest">Colis en attente</span>
            <span className="material-symbols-outlined text-tertiary">package_2</span>
          </div>
          <div className="text-3xl font-bold font-headline text-on-surface mb-2">
            {plan
              ? plan.tournees
                  .filter((t) => t.statut !== 'LANCEE')
                  .reduce((acc, t) => acc + t.nbColis, 0)
              : 0}
          </div>
          <p className="text-xs text-outline font-medium">colis non encore pris en charge</p>
        </div>

        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-outline uppercase tracking-widest">Estimation de fin</span>
            <span className="material-symbols-outlined text-secondary">schedule</span>
          </div>
          <div className="text-3xl font-bold font-headline text-on-surface mb-2">
            {plan && plan.nonAffectees === 0 && plan.lancees === plan.totalTournees ? '—' : 'En attente'}
          </div>
          <p className="text-xs text-secondary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            Disponible après lancement de toutes les tournées
          </p>
        </div>
      </div>
    </div>
  );
}
