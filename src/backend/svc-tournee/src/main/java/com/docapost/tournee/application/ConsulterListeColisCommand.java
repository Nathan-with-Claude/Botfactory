package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.LivreurId;

import java.time.LocalDate;

/**
 * Command — Consulter la liste des colis d'une tournee.
 * Immutable par construction (record Java).
 *
 * Utilise par ConsulterListeColisHandler.
 */
public record ConsulterListeColisCommand(
        LivreurId livreurId,
        LocalDate date
) {
}
