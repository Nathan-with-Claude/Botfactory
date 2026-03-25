package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.TourneeId;

import java.util.Objects;

/**
 * Command — CloturerTournee
 *
 * Commande envoyee par l'Interface Layer pour declencher la cloture d'une tournee.
 * Source : US-007 — POST /api/tournees/{tourneeId}/cloture
 */
public record CloturerTourneeCommand(TourneeId tourneeId) {

    public CloturerTourneeCommand {
        Objects.requireNonNull(tourneeId, "TourneeId est obligatoire");
    }
}
