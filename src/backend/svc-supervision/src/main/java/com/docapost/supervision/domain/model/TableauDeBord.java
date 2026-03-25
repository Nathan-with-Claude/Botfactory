package com.docapost.supervision.domain.model;

import java.util.List;
import java.util.Objects;

/**
 * Value Object — TableauDeBord (BC-03 Supervision — US-011)
 *
 * Agrège la liste des VueTournee et les compteurs du bandeau résumé.
 * Immuable : reconstruit à chaque lecture ou broadcast WebSocket.
 *
 * Compteurs du bandeau :
 * - actives  : tournées EN_COURS (hors A_RISQUE)
 * - aRisque  : tournées A_RISQUE
 * - cloturees : tournées CLOTUREES
 *
 * Source : US-011 — "Tableau de bord des tournées en temps réel"
 */
public record TableauDeBord(
        List<VueTournee> tournees,
        int actives,
        int aRisque,
        int cloturees
) {

    public TableauDeBord {
        Objects.requireNonNull(tournees, "La liste des tournées est obligatoire");
        tournees = List.copyOf(tournees); // immuable
    }

    /**
     * Factory — construit un TableauDeBord depuis une liste de VueTournee
     * en calculant automatiquement les compteurs du bandeau.
     */
    public static TableauDeBord of(List<VueTournee> tournees) {
        int actives = (int) tournees.stream()
                .filter(t -> t.getStatut() == StatutTourneeVue.EN_COURS)
                .count();
        int aRisque = (int) tournees.stream()
                .filter(t -> t.getStatut() == StatutTourneeVue.A_RISQUE)
                .count();
        int cloturees = (int) tournees.stream()
                .filter(t -> t.getStatut() == StatutTourneeVue.CLOTUREE)
                .count();
        return new TableauDeBord(tournees, actives, aRisque, cloturees);
    }
}
