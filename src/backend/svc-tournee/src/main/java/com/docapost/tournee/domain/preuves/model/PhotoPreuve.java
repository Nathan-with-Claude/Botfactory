package com.docapost.tournee.domain.preuves.model;

import java.util.Objects;

/**
 * Value Object — Photo du colis déposé comme preuve de livraison.
 * Stockée en objet store (MinIO/S3-compatible). Référencée par son URL et son hash d'intégrité.
 *
 * Source Ubiquitous Language — BC-02 Gestion des Preuves (US-009).
 */
public record PhotoPreuve(String urlPhoto, String hashIntegrite) {

    public PhotoPreuve {
        Objects.requireNonNull(urlPhoto, "L'URL de la photo est obligatoire");
        if (urlPhoto.isBlank()) {
            throw new PreuveLivraisonInvariantException(
                    "L'URL de la photo ne peut pas etre vide"
            );
        }
    }
}
