package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.Disposition;
import com.docapost.tournee.domain.model.MotifNonLivraison;
import com.docapost.tournee.domain.model.TourneeId;

/**
 * Command — Déclarer un échec de livraison (US-005)
 *
 * Porte les paramètres nécessaires à la déclaration d'un échec :
 * - tourneeId et colisId pour localiser le colis
 * - motif normalisé (obligatoire)
 * - disposition (obligatoire)
 * - noteLibre optionnelle (max 250 caractères)
 *
 * Source : US-005 — "Déclarer un échec de livraison avec motif normalisé et disposition."
 */
public record DeclarerEchecLivraisonCommand(
        TourneeId tourneeId,
        ColisId colisId,
        MotifNonLivraison motif,
        Disposition disposition,
        String noteLibre
) {}
