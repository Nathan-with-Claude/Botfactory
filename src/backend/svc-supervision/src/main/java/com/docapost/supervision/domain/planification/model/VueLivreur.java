package com.docapost.supervision.domain.planification.model;

/**
 * VueLivreur — Read Model immuable (Value Object) BC-07 / US-066
 *
 * Représente l'état journalier d'un livreur tel que vu par le superviseur
 * sur l'écran W-08 "État des livreurs".
 *
 * Agrégation à la volée depuis TourneePlanifieeRepository + LivreurReferentiel.
 * Non persisté — calculé à chaque requête GET /api/supervision/livreurs/etat-du-jour.
 *
 * Source : US-066
 */
public record VueLivreur(
        /** Identifiant technique du livreur (ex: "livreur-pierre-martin") */
        String livreurId,
        /** Nom complet affiché dans la liste (ex: "Pierre Martin") */
        String nomComplet,
        /** État dérivé depuis le statut de la TourneePlanifiee */
        EtatJournalierLivreur etat,
        /** Identifiant de la TourneePlanifiee associée — null si SANS_TOURNEE */
        String tourneePlanifieeId,
        /** Code TMS de la tournée (ex: "T-201") — null si SANS_TOURNEE */
        String codeTms
) {}
