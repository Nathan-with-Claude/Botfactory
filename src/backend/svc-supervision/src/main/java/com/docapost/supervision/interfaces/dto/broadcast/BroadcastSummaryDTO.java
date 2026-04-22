package com.docapost.supervision.interfaces.dto.broadcast;

import java.time.Instant;

/**
 * BroadcastSummaryDTO — DTO Interface BC-03 / US-069
 *
 * Résumé d'un BroadcastMessage pour l'historique du jour dans W-09.
 * Inclut les compteurs "Vu par N / M livreurs" calculés depuis la projection.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
public record BroadcastSummaryDTO(
        /** Identifiant unique du BroadcastMessage */
        String broadcastMessageId,
        /** Type : ALERTE, INFO ou CONSIGNE */
        String type,
        /** Contenu textuel du message */
        String texte,
        /** Horodatage d'envoi (UTC) */
        Instant horodatageEnvoi,
        /** Nombre total de destinataires */
        int nombreDestinataires,
        /** Nombre de livreurs ayant vu le message */
        int nombreVus
) {}
