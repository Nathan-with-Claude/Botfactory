package com.docapost.supervision.application.planification;

/**
 * VerifierCompatibiliteVehiculeCommand — Command BC-07 (US-030)
 *
 * Commande de vérification de compatibilité entre un véhicule et la charge d'une tournée.
 *
 * @param tourneePlanifieeId identifiant de la tournée à vérifier
 * @param vehiculeId         identifiant du véhicule sélectionné
 * @param forcerSiDepassement true si le logisticien force l'affectation malgré le dépassement
 * @param superviseurId      identifiant du logisticien effectuant l'action
 *
 * Source : US-030
 */
public record VerifierCompatibiliteVehiculeCommand(
        String tourneePlanifieeId,
        String vehiculeId,
        boolean forcerSiDepassement,
        String superviseurId
) {}
