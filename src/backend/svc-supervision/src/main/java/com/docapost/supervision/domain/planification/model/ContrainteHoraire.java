package com.docapost.supervision.domain.planification.model;

import java.util.Objects;

/**
 * ContrainteHoraire — Value Object représentant une contrainte temporelle sur des colis (BC-07)
 *
 * Exemples : "Livraison avant 10h00 — 6 colis"
 * Immuable. Comparaison par valeur.
 *
 * Source : US-022
 */
public final class ContrainteHoraire {

    private final String libelle;
    private final int nbColisAffectes;

    public ContrainteHoraire(String libelle, int nbColisAffectes) {
        this.libelle = Objects.requireNonNull(libelle, "Le libellé de contrainte est obligatoire");
        if (nbColisAffectes < 0) throw new IllegalArgumentException("nbColisAffectes ne peut pas être négatif");
        this.nbColisAffectes = nbColisAffectes;
    }

    public String getLibelle() { return libelle; }
    public int getNbColisAffectes() { return nbColisAffectes; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ContrainteHoraire that)) return false;
        return nbColisAffectes == that.nbColisAffectes && Objects.equals(libelle, that.libelle);
    }

    @Override
    public int hashCode() { return Objects.hash(libelle, nbColisAffectes); }

    @Override
    public String toString() { return libelle + " — " + nbColisAffectes + " colis"; }
}
