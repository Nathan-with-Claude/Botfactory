package com.docapost.supervision.application;

/**
 * Query — Consulter les instructions ENVOYEE d'une tournée (BC-03/BC-04 — US-016).
 *
 * Utilisé par le polling mobile du livreur pour détecter les nouvelles instructions
 * en l'absence de FCM (Firebase Cloud Messaging) dans le MVP.
 *
 * Source : US-016 — "Recevoir une notification push quand le superviseur modifie ma tournée"
 */
public record ConsulterInstructionsEnAttenteQuery(String tourneeId) {}
