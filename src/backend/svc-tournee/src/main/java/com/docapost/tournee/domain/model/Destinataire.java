package com.docapost.tournee.domain.model;

/**
 * Value Object — Destinataire d'un Colis.
 * Immuable, comparaison par valeur.
 * telephoneChiffre : numeros de telephone sans formatage pour eviter les fuites de
 * donnees personnelles directement dans l'UI.
 */
public record Destinataire(
        String nom,
        String telephoneChiffre
) {
    public Destinataire {
        if (nom == null || nom.isBlank()) {
            throw new IllegalArgumentException("Le nom du destinataire est obligatoire");
        }
    }
}
