package com.docapost.tournee.domain.preuves.model;

import java.util.Arrays;
import java.util.Objects;

/**
 * Value Object — Données d'une signature numérique capturée sur pad tactile.
 * Immuable. Contient les données brutes encodées (tracé vectoriel ou bitmap).
 *
 * Source Ubiquitous Language — BC-02 Gestion des Preuves (US-008).
 */
public record SignatureNumerique(byte[] donneesBase64) {

    public SignatureNumerique {
        Objects.requireNonNull(donneesBase64, "Les donnees de signature sont obligatoires");
        if (donneesBase64.length == 0) {
            throw new PreuveLivraisonInvariantException(
                    "Les donnees de signature ne peuvent pas etre vides"
            );
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SignatureNumerique that)) return false;
        return Arrays.equals(donneesBase64, that.donneesBase64);
    }

    @Override
    public int hashCode() {
        return Arrays.hashCode(donneesBase64);
    }
}
