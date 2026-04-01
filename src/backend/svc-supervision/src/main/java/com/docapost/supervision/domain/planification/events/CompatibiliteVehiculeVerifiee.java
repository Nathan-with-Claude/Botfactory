package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * CompatibiliteVehiculeVerifiee — Domain Event BC-07 Planification
 *
 * Émis quand la vérification de compatibilité véhicule/charge est positive :
 * le poids estimé de la tournée est inférieur ou égal à la capacité du véhicule.
 *
 * Source : US-030 — Scénario 1
 */
public record CompatibiliteVehiculeVerifiee(
        String tourneePlanifieeId,
        String codeTms,
        String vehiculeId,
        int poidsEstimeKg,
        int capaciteKg,
        int margeKg,
        String superviseurId,
        Instant verifieLe
) {}
