package com.docapost.supervision.interfaces.dto.broadcast;

import java.time.Instant;

/**
 * BroadcastCreeDTO — DTO de réponse 201 Created BC-03 / US-067
 *
 * Retourné par POST /api/supervision/broadcasts en cas de succès.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record BroadcastCreeDTO(
        /** Identifiant du BroadcastMessage créé */
        String broadcastMessageId,
        /** Nombre de livreurs destinataires effectifs */
        int nombreDestinataires,
        /** Horodatage d'envoi (UTC, format ISO-8601) */
        Instant horodatageEnvoi
) {}
