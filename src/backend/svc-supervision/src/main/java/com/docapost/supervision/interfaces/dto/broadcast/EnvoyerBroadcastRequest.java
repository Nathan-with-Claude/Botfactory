package com.docapost.supervision.interfaces.dto.broadcast;

/**
 * EnvoyerBroadcastRequest — DTO de requête POST /api/supervision/broadcasts BC-03 / US-067
 *
 * Corps de la requête HTTP pour l'envoi d'un broadcast.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record EnvoyerBroadcastRequest(
        /** Nature du message : "ALERTE", "INFO", "CONSIGNE" */
        String type,
        /** Contenu textuel (1 à 280 caractères) */
        String texte,
        /** Stratégie de ciblage */
        BroadcastCiblageRequest ciblage
) {}
