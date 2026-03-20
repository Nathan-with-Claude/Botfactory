package com.docapost.tournee.domain.model;

/**
 * Value Object — Adresse de livraison d'un Colis.
 * Immuable, comparaison par valeur.
 *
 * Source domaine : Ubiquitous Language DocuPost.
 */
public record Adresse(
        String rue,
        String complementAdresse,
        String codePostal,
        String ville,
        String zoneGeographique
) {
    public Adresse {
        if (rue == null || rue.isBlank()) {
            throw new IllegalArgumentException("L'adresse doit comporter une rue");
        }
        if (codePostal == null || codePostal.isBlank()) {
            throw new IllegalArgumentException("L'adresse doit comporter un code postal");
        }
        if (ville == null || ville.isBlank()) {
            throw new IllegalArgumentException("L'adresse doit comporter une ville");
        }
    }

    public String adresseComplete() {
        String complement = (complementAdresse != null && !complementAdresse.isBlank())
                ? " " + complementAdresse : "";
        return rue + complement + ", " + codePostal + " " + ville;
    }
}
