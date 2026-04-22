package com.docapost.supervision.interfaces.dto.broadcast;

import java.time.Instant;

/**
 * BroadcastRecuDTO — DTO Interface Layer BC-03 / US-068
 *
 * Représente un broadcast reçu par un livreur, retourné par
 * GET /api/supervision/broadcasts/recus.
 *
 * Le champ {@code vu} est false par défaut à ce stade (US-069 enrichira
 * ce champ avec le read model BroadcastStatutLivraison).
 *
 * Source : US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 */
public record BroadcastRecuDTO(
        /** Identifiant unique du BroadcastMessage */
        String broadcastMessageId,
        /** Type : ALERTE, INFO ou CONSIGNE */
        String type,
        /** Texte du message (max 280 caractères) */
        String texte,
        /** Identifiant du superviseur émetteur */
        String superviseurId,
        /** Horodatage d'envoi (UTC) */
        Instant horodatageEnvoi,
        /** true si le livreur a acquitté le message (false par défaut — US-069) */
        boolean vu
) {}
