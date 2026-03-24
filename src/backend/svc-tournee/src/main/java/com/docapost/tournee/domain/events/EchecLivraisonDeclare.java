package com.docapost.tournee.domain.events;

import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.Disposition;
import com.docapost.tournee.domain.model.MotifNonLivraison;
import com.docapost.tournee.domain.model.TourneeId;

import java.time.Instant;
import java.util.Objects;

/**
 * Domain Event — ÉchecLivraisonDéclaré
 *
 * Émis par l'Aggregate Tournée lorsqu'un livreur déclare l'échec
 * de livraison d'un colis avec un motif normalisé et une disposition.
 *
 * Immuable. Horodaté automatiquement à la création.
 * Source : US-005 — Déclarer un échec de livraison.
 *
 * Attributs clés (domain-model.md) :
 *   tourneeId, colisId, motif, disposition, horodatage, coordonnees
 * noteLibre : optionnelle (max 250 caractères).
 */
public record EchecLivraisonDeclare(
        TourneeId tourneeId,
        ColisId colisId,
        MotifNonLivraison motif,
        Disposition disposition,
        String noteLibre,
        Instant horodatage
) implements DomainEvent {

    public EchecLivraisonDeclare {
        Objects.requireNonNull(tourneeId, "TourneeId est obligatoire");
        Objects.requireNonNull(colisId, "ColisId est obligatoire");
        Objects.requireNonNull(motif, "MotifNonLivraison est obligatoire");
        Objects.requireNonNull(disposition, "Disposition est obligatoire");
        Objects.requireNonNull(horodatage, "Horodatage est obligatoire");
        if (noteLibre != null && noteLibre.length() > 250) {
            throw new IllegalArgumentException("La note libre ne peut pas dépasser 250 caractères");
        }
    }

    /**
     * Factory method — crée un EchecLivraisonDeclare horodaté maintenant.
     */
    public static EchecLivraisonDeclare of(
            TourneeId tourneeId,
            ColisId colisId,
            MotifNonLivraison motif,
            Disposition disposition,
            String noteLibre
    ) {
        return new EchecLivraisonDeclare(tourneeId, colisId, motif, disposition, noteLibre, Instant.now());
    }
}
