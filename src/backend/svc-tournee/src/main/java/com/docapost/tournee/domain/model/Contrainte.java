package com.docapost.tournee.domain.model;

/**
 * Value Object — Contrainte portee par un Colis.
 * Exemples : type=HORAIRE valeur="Avant 14h00", type=FRAGILE valeur="Manipuler avec soin"
 * Immuable, comparaison par valeur.
 */
public record Contrainte(
        TypeContrainte type,
        String valeur
) {
    public Contrainte {
        if (type == null) {
            throw new IllegalArgumentException("Le type de contrainte est obligatoire");
        }
        if (valeur == null || valeur.isBlank()) {
            throw new IllegalArgumentException("La valeur de la contrainte est obligatoire");
        }
    }

    public boolean estHoraire() {
        return TypeContrainte.HORAIRE.equals(type);
    }
}
