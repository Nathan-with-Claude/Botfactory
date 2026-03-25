package com.docapost.supervision.application.planification;

/**
 * LancerTourneeCommand — Command BC-07 (US-024)
 *
 * Source : US-024
 */
public record LancerTourneeCommand(
        String tourneePlanifieeId,
        String superviseurId
) {}
