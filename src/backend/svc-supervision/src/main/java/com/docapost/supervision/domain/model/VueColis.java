package com.docapost.supervision.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Value Object — VueColis (BC-03 Supervision — US-012)
 *
 * Vue d'un colis dans le détail d'une tournée superviseur.
 * Données projetées depuis BC-01 (lecture seule, non modifiable ici).
 *
 * Source : US-012 — "Détail d'une tournée superviseur"
 */
public record VueColis(
        String colisId,
        String adresse,
        String statut,
        String motifEchec,                // null si statut != ECHEC
        Instant horodatageTraitement      // null si non encore traité
) {

    public VueColis {
        Objects.requireNonNull(colisId, "ColisId est obligatoire");
        Objects.requireNonNull(adresse, "Adresse est obligatoire");
        Objects.requireNonNull(statut, "Statut est obligatoire");
        // motifEchec et horodatageTraitement peuvent être null
    }
}
