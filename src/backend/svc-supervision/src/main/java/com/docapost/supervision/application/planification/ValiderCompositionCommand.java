package com.docapost.supervision.application.planification;

/**
 * ValiderCompositionCommand — Command BC-07 (US-022)
 *
 * Source : US-022
 */
public record ValiderCompositionCommand(
        String tourneePlanifieeId,
        String superviseurId
) {}
