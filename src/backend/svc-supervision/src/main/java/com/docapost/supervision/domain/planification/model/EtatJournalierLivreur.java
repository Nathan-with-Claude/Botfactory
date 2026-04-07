package com.docapost.supervision.domain.planification.model;

/**
 * EtatJournalierLivreur — Value Object (enum) BC-07 / US-066
 *
 * Représente l'état calculé d'un livreur pour une journée donnée.
 * Valeur dérivée — jamais stockée en base.
 *
 * Règle de dérivation (depuis TourneePlanifieeRepository) :
 * - Aucune TourneePlanifiee avec livreurId pour la date → SANS_TOURNEE
 * - TourneePlanifiee.statut == AFFECTEE                  → AFFECTE_NON_LANCE
 * - TourneePlanifiee.statut == LANCEE                    → EN_COURS
 *
 * Source : US-066
 */
public enum EtatJournalierLivreur {
    /** Aucune tournée affectée au livreur pour la journée */
    SANS_TOURNEE,
    /** Tournée affectée mais pas encore lancée */
    AFFECTE_NON_LANCE,
    /** Tournée en cours (lancée par le superviseur) */
    EN_COURS
}
