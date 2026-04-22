package com.docapost.supervision.domain.broadcast.events;

import java.time.Instant;

/**
 * BroadcastVuEvent — Domain Event BC-03 / US-068
 *
 * Émis lorsqu'un livreur a consulté un BroadcastMessage (écran M-08).
 * Consommé par US-069 pour alimenter le read model BroadcastStatutLivraison.
 *
 * Idempotence : l'Application Service garantit qu'un seul event est émis
 * par couple (broadcastMessageId, livreurId) — les doublons sont ignorés.
 *
 * Source : US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 */
public record BroadcastVuEvent(
        /** Identifiant du BroadcastMessage acquitté */
        String broadcastMessageId,
        /** Identifiant du livreur ayant ouvert M-08 */
        String livreurId,
        /** Horodatage réel de l'affichage (UTC) — peut être antérieur si offline */
        Instant horodatageVu
) {}
