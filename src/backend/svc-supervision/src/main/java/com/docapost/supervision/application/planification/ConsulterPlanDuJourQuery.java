package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.StatutAffectation;

import java.time.LocalDate;

/**
 * ConsulterPlanDuJourQuery — Query BC-07 (US-021)
 *
 * Paramètres de la requête pour consulter le plan du jour :
 * - date : la date du plan à consulter (par défaut aujourd'hui)
 * - filtre : statut d'affectation optionnel (NON_AFFECTEE, AFFECTEE, LANCEE)
 *
 * Source : US-021
 */
public record ConsulterPlanDuJourQuery(
        LocalDate date,
        StatutAffectation filtre
) {
    /**
     * Requête pour aujourd'hui sans filtre.
     */
    public static ConsulterPlanDuJourQuery pourAujourdHui() {
        return new ConsulterPlanDuJourQuery(LocalDate.now(), null);
    }

    /**
     * Requête pour une date donnée sans filtre.
     */
    public static ConsulterPlanDuJourQuery pourDate(LocalDate date) {
        return new ConsulterPlanDuJourQuery(date, null);
    }
}
