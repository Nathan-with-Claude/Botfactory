package com.docapost.supervision.application.broadcast;

/**
 * BroadcastMessageInconnuException — US-068
 *
 * Levée par MarquerBroadcastVuHandler quand le broadcastMessageId
 * ne correspond à aucun BroadcastMessage persisté.
 * Traduite en HTTP 404 par le BroadcastController.
 *
 * Source : US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 */
public class BroadcastMessageInconnuException extends RuntimeException {

    public BroadcastMessageInconnuException(String broadcastMessageId) {
        super("BroadcastMessage introuvable : " + broadcastMessageId);
    }
}
