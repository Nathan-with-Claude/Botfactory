package com.docapost.supervision.application;

import java.util.Objects;

/**
 * Query — Consulter le détail d'une tournée superviseur (US-012).
 *
 * @param tourneeId identifiant de la tournée à consulter
 */
public record ConsulterDetailTourneeQuery(String tourneeId) {

    public ConsulterDetailTourneeQuery {
        Objects.requireNonNull(tourneeId, "TourneeId est obligatoire");
    }
}
