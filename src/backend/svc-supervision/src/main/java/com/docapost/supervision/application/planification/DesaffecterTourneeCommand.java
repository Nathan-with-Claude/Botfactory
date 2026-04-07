package com.docapost.supervision.application.planification;

/**
 * DesaffecterTourneeCommand — Commande Application Layer BC-07 (US-050)
 *
 * Demande la désaffectation du livreur d'une tournée planifiée.
 *
 * Source : US-050
 */
public record DesaffecterTourneeCommand(
        String tourneePlanifieeId,
        String superviseurId
) {}
