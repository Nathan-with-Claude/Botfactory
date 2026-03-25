package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.model.Disposition;
import com.docapost.tournee.domain.model.MotifNonLivraison;

/**
 * DTO de requête — POST /api/tournees/{tourneeId}/colis/{colisId}/echec (US-005)
 *
 * Reçu depuis le frontend mobile (écran M-05).
 * Traduit en DeclarerEchecLivraisonCommand par la couche Interface.
 *
 * Le motif et la disposition sont obligatoires.
 * La noteLibre est optionnelle (max 250 caractères).
 */
public record DeclarerEchecRequest(
        MotifNonLivraison motif,
        Disposition disposition,
        String noteLibre
) {}
