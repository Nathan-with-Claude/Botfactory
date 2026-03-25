package com.docapost.tournee.domain.preuves.model;

import java.util.Objects;
import java.util.UUID;

/**
 * Value Object — Identifiant d'une PreuveLivraison.
 * Généré automatiquement (UUID v4) à la création de la preuve.
 *
 * Source Ubiquitous Language — BC-02 Gestion des Preuves.
 */
public record PreuveLivraisonId(String value) {

    public PreuveLivraisonId {
        Objects.requireNonNull(value, "PreuveLivraisonId ne peut pas etre null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("PreuveLivraisonId ne peut pas etre vide");
        }
    }

    public static PreuveLivraisonId generate() {
        return new PreuveLivraisonId(UUID.randomUUID().toString());
    }

    @Override
    public String toString() {
        return value;
    }
}
