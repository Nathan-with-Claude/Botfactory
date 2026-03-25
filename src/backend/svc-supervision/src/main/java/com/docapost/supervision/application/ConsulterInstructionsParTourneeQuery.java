package com.docapost.supervision.application;

/**
 * Query — Consulter toutes les instructions d'une tournée (BC-03 Supervision — US-015).
 *
 * Utilisé pour afficher l'onglet "Instructions" dans l'écran W-02 (DetailTourneePage).
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
public record ConsulterInstructionsParTourneeQuery(String tourneeId) {}
