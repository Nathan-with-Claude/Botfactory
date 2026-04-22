package com.docapost.supervision.application.broadcast;

/**
 * MarquerBroadcastVuCommand — Commande Application Layer BC-03 / US-068
 *
 * Déclenche l'acquittement d'un BroadcastMessage par un livreur.
 * Le livreurId est extrait du JWT côté contrôleur — il n'est jamais fourni
 * directement par le client.
 *
 * Source : US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 */
public record MarquerBroadcastVuCommand(
        /** Identifiant du BroadcastMessage à acquitter */
        String broadcastMessageId,
        /** Identifiant du livreur qui a consulté le message (extrait du JWT) */
        String livreurId
) {}
