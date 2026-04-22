package com.docapost.supervision.application.broadcast;

/**
 * LivreurNonDestinataireException — US-068
 *
 * Levée par MarquerBroadcastVuHandler quand le livreurId du JWT
 * n'est pas dans la liste des destinataires du BroadcastMessage.
 * Traduite en HTTP 403 par le BroadcastController (ENF-BROADCAST-006).
 *
 * Source : US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 */
public class LivreurNonDestinataireException extends RuntimeException {

    public LivreurNonDestinataireException(String livreurId, String broadcastMessageId) {
        super("Le livreur " + livreurId
                + " n'est pas destinataire du broadcast " + broadcastMessageId);
    }
}
