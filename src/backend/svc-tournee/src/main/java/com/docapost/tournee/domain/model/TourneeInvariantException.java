package com.docapost.tournee.domain.model;

/**
 * Exception de domaine — violation d'un invariant de l'agregat Tournee.
 * Exemple : tenter de demarrer une tournee sans colis.
 */
public class TourneeInvariantException extends RuntimeException {

    public TourneeInvariantException(String message) {
        super(message);
    }
}
