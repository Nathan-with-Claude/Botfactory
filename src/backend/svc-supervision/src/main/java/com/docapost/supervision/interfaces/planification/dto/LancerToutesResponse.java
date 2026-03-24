package com.docapost.supervision.interfaces.planification.dto;

/**
 * LancerToutesResponse — DTO de sortie pour le lancement groupé (US-024 SC3)
 *
 * Source : US-024
 */
public record LancerToutesResponse(int nbTourneesLancees, String message) {
    public static LancerToutesResponse of(int nb) {
        return new LancerToutesResponse(nb, nb + " tournée(s) lancée(s) avec succès.");
    }
}
