package com.docapost.tournee.domain.model;

import java.util.Objects;

/**
 * Value Object — Identifiant de la Tournee.
 * Immuable, comparaison par valeur.
 */
public record TourneeId(String value) {

    public TourneeId {
        Objects.requireNonNull(value, "TourneeId ne peut pas etre null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("TourneeId ne peut pas etre vide");
        }
    }

    @Override
    public String toString() {
        return value;
    }
}
