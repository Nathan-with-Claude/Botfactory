package com.docapost.supervision.application.broadcast;

import java.time.LocalDate;

/**
 * ConsulterBroadcastsDuJourQuery — Query BC-03 / US-069
 *
 * Paramètre de la requête pour consulter les broadcasts du jour.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
public record ConsulterBroadcastsDuJourQuery(
        /** Date pour laquelle récupérer les broadcasts (en général: aujourd'hui) */
        LocalDate date
) {}
