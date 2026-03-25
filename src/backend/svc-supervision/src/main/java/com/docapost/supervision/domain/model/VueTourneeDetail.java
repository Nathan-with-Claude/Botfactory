package com.docapost.supervision.domain.model;

import java.util.List;
import java.util.Objects;

/**
 * Read Model — VueTourneeDetail (BC-03 Supervision — US-012)
 *
 * Détail complet d'une tournée pour le superviseur (écran W-02).
 * Extension de VueTournee avec la liste des colis et des incidents.
 *
 * Source : US-012 — "Détail d'une tournée superviseur"
 */
public record VueTourneeDetail(
        VueTournee vueTournee,
        List<VueColis> colis,
        List<IncidentVue> incidents
) {

    public VueTourneeDetail {
        Objects.requireNonNull(vueTournee, "VueTournee est obligatoire");
        Objects.requireNonNull(colis, "Liste colis est obligatoire");
        Objects.requireNonNull(incidents, "Liste incidents est obligatoire");
        colis = List.copyOf(colis);
        incidents = List.copyOf(incidents);
    }
}
