package com.docapost.tournee.domain.preuves.model;

/**
 * Exception domaine — Invariant de PreuveLivraison violé.
 * Levée lorsqu'une règle métier de la PreuveLivraison n'est pas respectée.
 *
 * Source Ubiquitous Language — BC-02 Gestion des Preuves.
 */
public class PreuveLivraisonInvariantException extends RuntimeException {

    public PreuveLivraisonInvariantException(String message) {
        super(message);
    }
}
