package com.docapost.supervision.domain.planification.events;

import java.time.Instant;

/**
 * CompatibiliteVehiculeEchouee — Domain Event BC-07 Planification
 *
 * Émis quand le logisticien force l'affectation d'un véhicule malgré le dépassement de capacité.
 * Trace la décision de forçage avec l'identité du responsable et le delta de dépassement.
 *
 * Source : US-030 — Scénario 3
 */
public record CompatibiliteVehiculeEchouee(
        String tourneePlanifieeId,
        String codeTms,
        String vehiculeId,
        int poidsEstimeKg,
        int capaciteKg,
        int depassementKg,
        String superviseurId,
        Instant forceeLe
) {}
