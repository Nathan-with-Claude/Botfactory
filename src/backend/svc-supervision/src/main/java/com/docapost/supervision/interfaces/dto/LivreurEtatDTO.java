package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.planification.model.VueLivreur;

/**
 * LivreurEtatDTO — DTO de l'Interface Layer BC-07 / US-066
 *
 * Représentation JSON retournée par GET /api/supervision/livreurs/etat-du-jour.
 * Les objets du domaine (VueLivreur) ne traversent jamais la frontière Interface Layer.
 *
 * Source : US-066
 */
public record LivreurEtatDTO(
        /** Identifiant technique du livreur (ex: "livreur-pierre-martin") */
        String livreurId,
        /** Nom complet affiché (ex: "Pierre Martin") */
        String nomComplet,
        /** État du jour : "SANS_TOURNEE" | "AFFECTE_NON_LANCE" | "EN_COURS" */
        String etat,
        /** Identifiant de la TourneePlanifiee — null si SANS_TOURNEE */
        String tourneePlanifieeId,
        /** Code TMS de la tournée (ex: "T-201") — null si SANS_TOURNEE */
        String codeTms
) {
    /**
     * Factory method — traduit un VueLivreur domaine en DTO.
     * Assure que les objets domaine ne sont pas exposés hors de l'Application Layer.
     */
    public static LivreurEtatDTO fromDomain(VueLivreur vue) {
        return new LivreurEtatDTO(
                vue.livreurId(),
                vue.nomComplet(),
                vue.etat().name(),
                vue.tourneePlanifieeId(),
                vue.codeTms()
        );
    }
}
