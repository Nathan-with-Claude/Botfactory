package com.docapost.tournee.domain.model;

import java.util.Objects;

/**
 * Value Object — Identifiant d'un Colis.
 * Immuable, comparaison par valeur.
 */
public record ColisId(String value) {

    public ColisId {
        Objects.requireNonNull(value, "ColisId ne peut pas etre null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("ColisId ne peut pas etre vide");
        }
    }

    @Override
    public String toString() {
        return value;
    }
}
