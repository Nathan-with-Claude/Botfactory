package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.model.Avancement;
import com.docapost.tournee.domain.model.StatutTournee;
import com.docapost.tournee.domain.model.Tournee;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO — Representation d'une Tournee a la frontiere de la couche Interface.
 * Traduit depuis l'agregat Tournee du domaine.
 *
 * Destine a la reponse GET /api/tournees/today (US-001).
 * Inclut l'avancement calcule : resteALivrer, colisTotal.
 */
public record TourneeDTO(
        String tourneeId,
        String livreurId,
        LocalDate date,
        StatutTournee statut,
        List<ColisDTO> colis,
        int resteALivrer,
        int colisTotal,
        int colisTraites,
        LocalTime estimationFin,
        boolean estTerminee
) {
    public static TourneeDTO from(Tournee tournee) {
        Avancement avancement = tournee.calculerAvancement();

        List<ColisDTO> colisDTO = tournee.getColis().stream()
                .map(ColisDTO::from)
                .toList();

        return new TourneeDTO(
                tournee.getId().value(),
                tournee.getLivreurId().value(),
                tournee.getDate(),
                tournee.getStatut(),
                colisDTO,
                avancement.resteALivrer(),
                avancement.colisTotal(),
                avancement.colisTraites(),
                avancement.estimationFin(),
                avancement.estTerminee()
        );
    }
}
