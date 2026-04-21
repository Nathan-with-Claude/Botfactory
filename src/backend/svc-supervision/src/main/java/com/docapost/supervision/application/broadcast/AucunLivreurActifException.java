package com.docapost.supervision.application.broadcast;

/**
 * AucunLivreurActifException — Exception domaine BC-03 / US-067
 *
 * Levée lorsque le ciblage d'un broadcast ne trouve aucun livreur
 * avec l'état EN_COURS au moment de l'envoi.
 *
 * Résultat HTTP attendu : 422 Unprocessable Entity avec code AUCUN_LIVREUR_ACTIF.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public class AucunLivreurActifException extends RuntimeException {

    public AucunLivreurActifException() {
        super("Aucun livreur actif (EN_COURS) ne correspond au ciblage demandé");
    }

    public AucunLivreurActifException(String message) {
        super(message);
    }
}
