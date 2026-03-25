package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.application.RecapitulatifTourneeResult;
import com.docapost.tournee.domain.model.StatutTournee;

import java.time.LocalDate;

/**
 * DTO — Recapitulatif de tournee retourne apres cloture.
 * Traduit depuis l'objet Application RecapitulatifTournee.
 *
 * Destine a la reponse POST /api/tournees/{tourneeId}/cloture (US-007).
 */
public record RecapitulatifTourneeDTO(
        String tourneeId,
        String livreurId,
        LocalDate date,
        StatutTournee statut,
        int colisTotal,
        int colisLivres,
        int colisEchecs,
        int colisARepresenter
) {
    public static RecapitulatifTourneeDTO from(RecapitulatifTourneeResult recap) {
        return new RecapitulatifTourneeDTO(
                recap.tourneeId(),
                recap.livreurId(),
                recap.date(),
                recap.statut(),
                recap.colisTotal(),
                recap.colisLivres(),
                recap.colisEchecs(),
                recap.colisARepresenter()
        );
    }
}
