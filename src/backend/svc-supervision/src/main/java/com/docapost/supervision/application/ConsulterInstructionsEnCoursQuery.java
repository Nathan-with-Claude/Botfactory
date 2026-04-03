package com.docapost.supervision.application;

/**
 * Query — Consulter les instructions en cours (ENVOYEE | PRISE_EN_COMPTE) d'une tournée.
 *
 * Utilisé par l'écran M-03 (DetailColisScreen) pour afficher la "Consigne en cours"
 * après acceptation du bandeau, tant que l'instruction n'est pas exécutée.
 *
 * Source : Bug 1 — US-015 "Suivre l'état d'exécution d'une instruction"
 */
public record ConsulterInstructionsEnCoursQuery(String tourneeId) {
}
