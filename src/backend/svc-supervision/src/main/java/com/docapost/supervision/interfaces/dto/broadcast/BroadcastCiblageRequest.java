package com.docapost.supervision.interfaces.dto.broadcast;

import java.util.List;

/**
 * BroadcastCiblageRequest — DTO de requête BC-03 / US-067
 *
 * Représente la stratégie de ciblage d'un broadcast dans la requête HTTP.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record BroadcastCiblageRequest(
        /** "TOUS" ou "SECTEUR" */
        String type,
        /** Codes secteurs (requis si type == "SECTEUR", ignoré sinon) */
        List<String> secteurs
) {}
