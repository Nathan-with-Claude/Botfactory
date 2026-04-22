package com.docapost.supervision.application.broadcast;

/**
 * ConsulterStatutsLectureQuery — Query BC-03 / US-069
 *
 * Paramètre de la requête pour consulter les statuts de lecture
 * d'un BroadcastMessage (détail nominatif).
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
public record ConsulterStatutsLectureQuery(
        /** Identifiant du BroadcastMessage dont on veut les statuts */
        String broadcastMessageId
) {}
