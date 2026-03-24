package com.docapost.tournee.domain.preuves.model;

import java.util.Objects;

/**
 * Value Object — Dépôt sécurisé du colis (boîte aux lettres, gardien, etc.).
 * La description du lieu est obligatoire.
 *
 * Source Ubiquitous Language — BC-02 Gestion des Preuves (US-009).
 */
public record DepotSecurise(String description) {

    public DepotSecurise {
        Objects.requireNonNull(description, "La description du depot securise est obligatoire");
        if (description.isBlank()) {
            throw new PreuveLivraisonInvariantException(
                    "La description du depot securise ne peut pas etre vide"
            );
        }
    }
}
