package com.docapost.supervision.domain.planification.model;

import java.util.Objects;

/**
 * VehiculeId — Value Object BC-07 Planification
 *
 * Identifiant immuable d'un Vehicule.
 * La comparaison est par valeur (pas par référence).
 *
 * Source : US-030
 */
public final class VehiculeId {

    private final String valeur;

    public VehiculeId(String valeur) {
        Objects.requireNonNull(valeur, "Le vehiculeId ne peut pas être null");
        if (valeur.isBlank()) throw new IllegalArgumentException("Le vehiculeId ne peut pas être vide");
        this.valeur = valeur;
    }

    public String getValeur() {
        return valeur;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof VehiculeId that)) return false;
        return Objects.equals(valeur, that.valeur);
    }

    @Override
    public int hashCode() {
        return Objects.hash(valeur);
    }

    @Override
    public String toString() {
        return valeur;
    }
}
