package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.StatutTournee;

import java.time.LocalDate;

/**
 * DTO Application — RecapitulatifTourneeResult
 *
 * Resultat retourne par CloturerTourneeHandler a la couche Interface.
 * Traduit depuis le Value Object domain RecapitulatifTournee et l'Aggregate Tournee.
 *
 * Nomme "Result" pour eviter la collision avec domain.model.RecapitulatifTournee.
 *
 * Source : US-007 — "Voir immediatement un recapitulatif de ma journee." (Pierre)
 */
public record RecapitulatifTourneeResult(
        String tourneeId,
        String livreurId,
        LocalDate date,
        StatutTournee statut,
        int colisTotal,
        int colisLivres,
        int colisEchecs,
        int colisARepresenter
) {
    public static RecapitulatifTourneeResult from(
            com.docapost.tournee.domain.model.Tournee tournee,
            com.docapost.tournee.domain.model.RecapitulatifTournee recap
    ) {
        return new RecapitulatifTourneeResult(
                tournee.getId().value(),
                tournee.getLivreurId().value(),
                tournee.getDate(),
                tournee.getStatut(),
                recap.colisTotal(),
                recap.colisLivres(),
                recap.colisEchecs(),
                recap.colisARepresenter()
        );
    }
}
