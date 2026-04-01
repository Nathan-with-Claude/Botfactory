package com.docapost.supervision.interfaces.planification.dto;

/**
 * VerifierCompatibiliteRequest — DTO d'entrée pour la vérification de compatibilité (US-030)
 *
 * @param vehiculeId          identifiant du véhicule à vérifier
 * @param forcerSiDepassement true si le logisticien force l'affectation malgré dépassement
 *
 * Source : US-030
 */
public record VerifierCompatibiliteRequest(
        String vehiculeId,
        boolean forcerSiDepassement
) {}
