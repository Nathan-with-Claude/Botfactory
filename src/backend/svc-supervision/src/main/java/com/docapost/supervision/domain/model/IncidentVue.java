package com.docapost.supervision.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Value Object — IncidentVue (BC-03 Supervision — US-012)
 *
 * Représente un incident signalé sur un colis lors d'une tournée.
 * Projeté depuis les Domain Events EchecLivraisonDeclare de BC-01.
 *
 * Source : US-012 — "Détail d'une tournée superviseur"
 */
public record IncidentVue(
        String colisId,
        String adresse,
        String motif,
        Instant horodatage,
        String note        // note libre optionnelle
) {

    public IncidentVue {
        Objects.requireNonNull(colisId, "ColisId est obligatoire");
        Objects.requireNonNull(adresse, "Adresse est obligatoire");
        Objects.requireNonNull(motif, "Motif est obligatoire");
        Objects.requireNonNull(horodatage, "Horodatage est obligatoire");
        // note peut être null
    }
}
