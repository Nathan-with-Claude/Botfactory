import React, { useEffect, useState, useCallback } from 'react';

/**
 * EtatLivreursPage — Page W-08 "État des livreurs du jour" (US-066)
 *
 * Affiche l'état journalier de tous les livreurs du référentiel :
 *   - SANS_TOURNEE    : aucune tournée affectée
 *   - AFFECTE_NON_LANCE : tournée affectée, non encore lancée
 *   - EN_COURS        : tournée lancée
 *
 * Alimentation :
 *   - Fetch initial : GET /api/supervision/livreurs/etat-du-jour
 *   - Mises à jour temps réel : STOMP /topic/livreurs/etat (optionnel)
 *   - Polling fallback toutes les 30s si STOMP indisponible
 *
 * Source : US-066, specs-us066-etat-livreurs.md
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type EtatLivreur = 'SANS_TOURNEE' | 'AFFECTE_NON_LANCE' | 'EN_COURS';

export interface LivreurEtatDTO {
  livreurId: string;
  nomComplet: string;
  etat: EtatLivreur;
  tourneePlanifieeId: string | null;
  codeTms: string | null;
}

type FiltreEtat = 'TOUS' | EtatLivreur;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface EtatLivreursPageProps {
  apiBaseUrl?: string;
  fetchFn?: typeof fetch;
  /** Callback WebSocket subscribe — injecté pour les tests et la prod STOMP */
  stompSubscribeFn?: (
    topic: string,
    callback: (msg: { body: string }) => void
  ) => { unsubscribe: () => void };
  /** Navigation vers la préparation / détail d'une tournée planifiée */
  onVoirTourneePlanifiee?: (tourneePlanifieeId: string) => void;
  /** Navigation vers W-04 pour affecter une tournée */
  onAffecter?: () => void;
}

// ─── Ordre de tri ─────────────────────────────────────────────────────────────

const ORDRE_TRI: Record<EtatLivreur, number> = {
  EN_COURS: 0,
  AFFECTE_NON_LANCE: 1,
  SANS_TOURNEE: 2,
};

// ─── Helpers de présentation ─────────────────────────────────────────────────

function badgeClasses(etat: EtatLivreur): string {
  switch (etat) {
    case 'EN_COURS':
      return 'bg-emerald-100 text-emerald-700';
    case 'AFFECTE_NON_LANCE':
      return 'bg-primary-container text-on-primary-container';
    case 'SANS_TOURNEE':
      return 'bg-surface-container text-on-surface-variant';
  }
}

function badgeLabel(etat: EtatLivreur, codeTms: string | null): string {
  switch (etat) {
    case 'EN_COURS':
      return codeTms ? `En cours — ${codeTms}` : 'En cours';
    case 'AFFECTE_NON_LANCE':
      return codeTms ? `Affecté — ${codeTms}` : 'Affecté';
    case 'SANS_TOURNEE':
      return 'Sans tournée';
  }
}

function initiales(nomComplet: string): string {
  return nomComplet
    .split(' ')
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Composant ────────────────────────────────────────────────────────────────

const POLLING_INTERVAL_MS = 30_000;

export default function EtatLivreursPage({
  apiBaseUrl = 'http://localhost:8082',
  fetchFn = fetch,
  stompSubscribeFn,
  onVoirTourneePlanifiee,
  onAffecter,
}: EtatLivreursPageProps) {
  const [livreurs, setLivreurs] = useState<LivreurEtatDTO[]>([]);
  const [filtre, setFiltre] = useState<FiltreEtat>('TOUS');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // ─── Fetch initial ─────────────────────────────────────────────────────────

  const chargerLivreurs = useCallback(async () => {
    try {
      const resp = await fetchFn(`${apiBaseUrl}/api/supervision/livreurs/etat-du-jour`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: LivreurEtatDTO[] = await resp.json();
      setLivreurs(data);
      setErreur(null);
    } catch (e) {
      setErreur('Impossible de charger l\'état des livreurs.');
    } finally {
      setChargement(false);
    }
  }, [apiBaseUrl, fetchFn]);

  useEffect(() => {
    chargerLivreurs();
  }, [chargerLivreurs]);

  // ─── Polling fallback (30s) ────────────────────────────────────────────────

  useEffect(() => {
    // Si STOMP est disponible, pas de polling (souscription WebSocket gère les mises à jour)
    if (stompSubscribeFn) return;

    const timer = setInterval(chargerLivreurs, POLLING_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [chargerLivreurs, stompSubscribeFn]);

  // ─── Souscription WebSocket STOMP ─────────────────────────────────────────

  useEffect(() => {
    if (!stompSubscribeFn) return;

    const subscription = stompSubscribeFn('/topic/livreurs/etat', (msg) => {
      const update: LivreurEtatDTO = JSON.parse(msg.body);
      setLivreurs((prev) =>
        prev.map((l) => (l.livreurId === update.livreurId ? update : l))
      );
    });

    return () => subscription.unsubscribe();
  }, [stompSubscribeFn]);

  // ─── Données filtrées et triées ───────────────────────────────────────────

  const livreursAffiches = [...livreurs]
    .sort((a, b) => ORDRE_TRI[a.etat] - ORDRE_TRI[b.etat])
    .filter((l) => filtre === 'TOUS' || l.etat === filtre);

  // ─── Compteurs bandeau ─────────────────────────────────────────────────────

  const nbSansTournee = livreurs.filter((l) => l.etat === 'SANS_TOURNEE').length;
  const nbAffectes = livreurs.filter((l) => l.etat === 'AFFECTE_NON_LANCE').length;
  const nbEnCours = livreurs.filter((l) => l.etat === 'EN_COURS').length;

  // ─── Date du jour ──────────────────────────────────────────────────────────

  const dateAujourdHui = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // ─── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-surface p-6" data-testid="page-etat-livreurs">

      {/* En-tête */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-on-surface"
          data-testid="titre-etat-livreurs"
        >
          État des livreurs
        </h1>
        <p className="text-sm text-on-surface-variant mt-1" data-testid="date-etat-livreurs">
          {dateAujourdHui}
        </p>
      </div>

      {/* Bandeau résumé 3 tuiles */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-surface-container rounded-xl p-4 text-center shadow-sm">
          <p
            className="text-3xl font-bold text-on-surface-variant"
            data-testid="compteur-sans-tournee"
          >
            {nbSansTournee}
          </p>
          <p className="text-sm text-on-surface-variant mt-1">Sans tournée</p>
        </div>
        <div className="bg-primary-container rounded-xl p-4 text-center shadow-sm">
          <p
            className="text-3xl font-bold text-on-primary-container"
            data-testid="compteur-affectes"
          >
            {nbAffectes}
          </p>
          <p className="text-sm text-on-primary-container mt-1">Affectés</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center shadow-sm">
          <p
            className="text-3xl font-bold text-emerald-700"
            data-testid="compteur-en-cours"
          >
            {nbEnCours}
          </p>
          <p className="text-sm text-emerald-700 mt-1">En cours</p>
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(
          [
            { key: 'TOUS', label: 'Tous' },
            { key: 'SANS_TOURNEE', label: 'Sans tournée' },
            { key: 'AFFECTE_NON_LANCE', label: 'Affecté' },
            { key: 'EN_COURS', label: 'En cours' },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            data-testid={`filtre-${key}`}
            onClick={() => setFiltre(key)}
            className={[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              filtre === key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
            ].join(' ')}
          >
            {label}
          </button>
        ))}

        <button
          data-testid="btn-rafraichir"
          onClick={chargerLivreurs}
          className="ml-auto px-4 py-2 rounded-full text-sm font-medium bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          Rafraîchir
        </button>
      </div>

      {/* État de chargement */}
      {chargement && (
        <div
          className="flex justify-center py-12"
          data-testid="chargement-livreurs"
        >
          <span className="text-on-surface-variant text-sm">Chargement…</span>
        </div>
      )}

      {/* Erreur */}
      {!chargement && erreur && (
        <div
          className="bg-error-container rounded-xl p-4 text-on-error-container text-sm"
          data-testid="erreur-livreurs"
          role="alert"
        >
          {erreur}
        </div>
      )}

      {/* Tableau */}
      {!chargement && !erreur && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-xs font-semibold uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Livreur</th>
                <th className="px-4 py-3 text-left">État</th>
                <th className="px-4 py-3 text-left">Tournée</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {livreursAffiches.map((livreur) => (
                <tr
                  key={livreur.livreurId}
                  data-testid={`ligne-livreur-${livreur.livreurId}`}
                  data-etat={livreur.etat}
                  className="hover:bg-surface-container-low transition-colors"
                >
                  {/* Livreur (initiales + nom) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {initiales(livreur.nomComplet)}
                      </div>
                      <span className="font-medium text-on-surface">
                        {livreur.nomComplet}
                      </span>
                    </div>
                  </td>

                  {/* Badge état */}
                  <td className="px-4 py-3">
                    <span
                      data-testid={`badge-livreur-${livreur.livreurId}`}
                      data-etat={livreur.etat}
                      className={[
                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
                        badgeClasses(livreur.etat),
                      ].join(' ')}
                    >
                      {badgeLabel(livreur.etat, livreur.codeTms)}
                    </span>
                  </td>

                  {/* Code TMS */}
                  <td className="px-4 py-3 text-on-surface-variant">
                    {livreur.codeTms ?? '—'}
                  </td>

                  {/* Bouton d'action contextuel */}
                  <td className="px-4 py-3 text-right">
                    <ActionButton
                      livreur={livreur}
                      onVoirTourneePlanifiee={onVoirTourneePlanifiee}
                      onAffecter={onAffecter}
                    />
                  </td>
                </tr>
              ))}

              {livreursAffiches.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-on-surface-variant text-sm"
                  >
                    Aucun livreur trouvé pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── ActionButton ─────────────────────────────────────────────────────────────

function ActionButton({
  livreur,
  onVoirTourneePlanifiee,
  onAffecter,
}: {
  livreur: LivreurEtatDTO;
  onVoirTourneePlanifiee?: (id: string) => void;
  onAffecter?: () => void;
}) {
  if (livreur.etat === 'SANS_TOURNEE') {
    return (
      <button
        data-testid={`action-livreur-${livreur.livreurId}`}
        onClick={() => onAffecter?.()}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity"
      >
        Affecter
      </button>
    );
  }

  if (livreur.etat === 'EN_COURS') {
    return (
      <button
        data-testid={`action-livreur-${livreur.livreurId}`}
        onClick={() => livreur.tourneePlanifieeId && onVoirTourneePlanifiee?.(livreur.tourneePlanifieeId)}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
      >
        Voir tournée
      </button>
    );
  }

  // AFFECTE_NON_LANCE
  return (
    <button
      data-testid={`action-livreur-${livreur.livreurId}`}
      onClick={() => livreur.tourneePlanifieeId && onVoirTourneePlanifiee?.(livreur.tourneePlanifieeId)}
      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity"
    >
      Voir préparation
    </button>
  );
}
