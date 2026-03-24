package com.docapost.supervision.domain.planification.model;

/**
 * PlanificationInvariantException — Exception métier BC-07
 *
 * Levée quand un invariant de planification est violé :
 * - Tentative de lancer une tournée NON_AFFECTEE
 * - Livreur ou véhicule déjà affecté pour la journée
 * - Affectation partielle (sans livreur ou sans véhicule)
 *
 * Source : US-023, US-024
 */
public class PlanificationInvariantException extends RuntimeException {

    public PlanificationInvariantException(String message) {
        super(message);
    }
}
