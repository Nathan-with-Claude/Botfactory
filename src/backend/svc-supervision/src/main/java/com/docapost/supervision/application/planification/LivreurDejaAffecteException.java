package com.docapost.supervision.application.planification;

/**
 * LivreurDejaAffecteException — Exception applicative BC-07 (US-023)
 *
 * Levée quand un livreur est déjà affecté à une autre tournée pour la journée.
 * Traduite en HTTP 409 dans l'Interface Layer.
 *
 * Source : US-023
 */
public class LivreurDejaAffecteException extends RuntimeException {

    public LivreurDejaAffecteException(String livreurId) {
        super("Le livreur " + livreurId + " est déjà affecté à une tournée pour la journée.");
    }
}
