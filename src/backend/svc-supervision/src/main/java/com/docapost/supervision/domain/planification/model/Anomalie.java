package com.docapost.supervision.domain.planification.model;

import java.util.Objects;

/**
 * Anomalie — Value Object représentant une anomalie détectée dans la composition d'une tournée (BC-07)
 *
 * Une anomalie ne bloque pas l'affectation : elle est signalée mais non bloquante
 * (décision de conception délibérée — US-022).
 *
 * Immuable. Comparaison par valeur.
 *
 * Source : US-022
 */
public final class Anomalie {

    private final String code;
    private final String description;

    public Anomalie(String code, String description) {
        this.code = Objects.requireNonNull(code, "Le code d'anomalie est obligatoire");
        this.description = Objects.requireNonNull(description, "La description d'anomalie est obligatoire");
    }

    public String getCode() { return code; }
    public String getDescription() { return description; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Anomalie that)) return false;
        return Objects.equals(code, that.code) && Objects.equals(description, that.description);
    }

    @Override
    public int hashCode() { return Objects.hash(code, description); }

    @Override
    public String toString() { return "[" + code + "] " + description; }
}
