package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.ColisId;

import java.util.Objects;

/**
 * Query — Consulter la preuve de livraison d'un colis (US-010).
 *
 * Utilisée par le support et les superviseurs pour consulter les preuves
 * dans le cadre du traitement de litiges.
 *
 * Source : US-010 — "Consulter la preuve d'une livraison pour traiter un litige"
 */
public record ConsulterPreuveLivraisonQuery(ColisId colisId) {

    public ConsulterPreuveLivraisonQuery {
        Objects.requireNonNull(colisId, "ColisId est obligatoire");
    }
}
