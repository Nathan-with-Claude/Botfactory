package com.docapost.supervision.domain.planification.model;

import java.util.Objects;

/**
 * ZoneTournee — Value Object représentant une zone géographique d'une tournée (BC-07)
 *
 * Immuable. Comparaison par valeur (nom + nbColis).
 *
 * Source : US-021, US-022
 */
public final class ZoneTournee {

    private final String nom;
    private final int nbColis;

    public ZoneTournee(String nom, int nbColis) {
        this.nom = Objects.requireNonNull(nom, "Le nom de zone est obligatoire");
        if (nbColis < 0) throw new IllegalArgumentException("nbColis ne peut pas être négatif");
        this.nbColis = nbColis;
    }

    public String getNom() { return nom; }
    public int getNbColis() { return nbColis; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ZoneTournee that)) return false;
        return nbColis == that.nbColis && Objects.equals(nom, that.nom);
    }

    @Override
    public int hashCode() { return Objects.hash(nom, nbColis); }

    @Override
    public String toString() { return nom + " (" + nbColis + " colis)"; }
}
