package com.docapost.tournee.domain.model;

import java.util.Objects;

/**
 * Value Object — Identifiant du Livreur (Shared Kernel avec BC-06 Identite).
 * Immuable, comparaison par valeur.
 */
public record LivreurId(String value) {

    public LivreurId {
        Objects.requireNonNull(value, "LivreurId ne peut pas etre null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("LivreurId ne peut pas etre vide");
        }
    }

    @Override
    public String toString() {
        return value;
    }
}
