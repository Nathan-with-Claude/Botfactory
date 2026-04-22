package com.docapost.supervision.interfaces.dto.broadcast;

/**
 * BroadcastStatutUpdateDTO — DTO WebSocket BC-03 / US-069
 *
 * Payload publié sur /topic/supervision/broadcasts/{date}
 * lorsqu'un livreur lit un broadcast (transition ENVOYE → VU).
 *
 * Utilisé par le frontend W-09 pour mettre à jour le compteur
 * "Vu par N / M livreurs" sans rechargement de page.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
public record BroadcastStatutUpdateDTO(
        /** Identifiant du BroadcastMessage mis à jour */
        String broadcastMessageId,
        /** Nouveau nombre de livreurs ayant vu le message */
        int nombreVus,
        /** Nombre total de destinataires (inchangé) */
        int nombreTotal
) {}
