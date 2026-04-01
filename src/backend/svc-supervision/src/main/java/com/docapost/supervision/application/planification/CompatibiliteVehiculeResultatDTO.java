package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.ResultatCompatibilite;

/**
 * CompatibiliteVehiculeResultatDTO — DTO de résultat (Application Layer) BC-07 (US-030)
 *
 * Retourné par VerifierCompatibiliteVehiculeHandler.
 * Reste dans l'Application Layer : traduit en DTO Interface Layer par le Controller.
 *
 * @param resultat              COMPATIBLE | DEPASSEMENT | POIDS_ABSENT
 * @param poidsEstimeKg         poids estimé (null si POIDS_ABSENT)
 * @param capaciteKg            capacité du véhicule
 * @param margeOuDepassementKg  marge (si COMPATIBLE) ou dépassement (si DEPASSEMENT)
 * @param vehiculeId            identifiant du véhicule évalué
 * @param message               message lisible pour l'UI
 *
 * Source : US-030
 */
public record CompatibiliteVehiculeResultatDTO(
        ResultatCompatibilite resultat,
        Integer poidsEstimeKg,
        int capaciteKg,
        int margeOuDepassementKg,
        String vehiculeId,
        String message
) {

    /**
     * Construit un résultat COMPATIBLE.
     */
    public static CompatibiliteVehiculeResultatDTO compatible(
            String vehiculeId, int poidsEstimeKg, int capaciteKg) {
        return new CompatibiliteVehiculeResultatDTO(
                ResultatCompatibilite.COMPATIBLE,
                poidsEstimeKg,
                capaciteKg,
                capaciteKg - poidsEstimeKg,
                vehiculeId,
                String.format("%s : capacité %d kg, tournée estimée %d kg — marge %d kg.",
                        vehiculeId, capaciteKg, poidsEstimeKg, capaciteKg - poidsEstimeKg)
        );
    }

    /**
     * Construit un résultat DEPASSEMENT.
     */
    public static CompatibiliteVehiculeResultatDTO depassement(
            String vehiculeId, int poidsEstimeKg, int capaciteKg) {
        return new CompatibiliteVehiculeResultatDTO(
                ResultatCompatibilite.DEPASSEMENT,
                poidsEstimeKg,
                capaciteKg,
                poidsEstimeKg - capaciteKg,
                vehiculeId,
                String.format("%s : capacité %d kg, tournée estimée %d kg — risque de surcharge.",
                        vehiculeId, capaciteKg, poidsEstimeKg)
        );
    }

    /**
     * Construit un résultat POIDS_ABSENT.
     */
    public static CompatibiliteVehiculeResultatDTO poidsAbsent(String vehiculeId, int capaciteKg) {
        return new CompatibiliteVehiculeResultatDTO(
                ResultatCompatibilite.POIDS_ABSENT,
                null,
                capaciteKg,
                0,
                vehiculeId,
                "Poids non disponible — vérification impossible."
        );
    }
}
