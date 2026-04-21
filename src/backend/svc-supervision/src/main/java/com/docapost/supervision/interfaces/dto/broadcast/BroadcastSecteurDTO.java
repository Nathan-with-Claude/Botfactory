package com.docapost.supervision.interfaces.dto.broadcast;

/**
 * BroadcastSecteurDTO — DTO de réponse GET /api/supervision/broadcast-secteurs BC-03 / US-067
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record BroadcastSecteurDTO(
        /** Code technique du secteur (ex: "SECT-IDF-01") */
        String codeSecteur,
        /** Libellé affiché dans l'interface superviseur */
        String libelle
) {}
