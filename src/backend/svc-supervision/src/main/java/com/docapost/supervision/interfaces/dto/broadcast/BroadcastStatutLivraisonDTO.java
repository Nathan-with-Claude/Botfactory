package com.docapost.supervision.interfaces.dto.broadcast;

import java.time.Instant;

/**
 * BroadcastStatutLivraisonDTO — DTO Interface BC-03 / US-069
 *
 * Détail nominatif du statut de lecture d'un livreur pour un BroadcastMessage donné.
 * Retourné par GET /api/supervision/broadcasts/{broadcastMessageId}/statuts.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
public record BroadcastStatutLivraisonDTO(
        /** Identifiant du livreur */
        String livreurId,
        /** Nom complet affiché dans le tableau détail */
        String nomComplet,
        /** Statut : "ENVOYE" (= EN ATTENTE) ou "VU" */
        String statut,
        /** Horodatage de lecture — null si statut == "ENVOYE" */
        Instant horodatageVu
) {}
