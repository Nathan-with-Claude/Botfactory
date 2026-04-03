package com.docapost.supervision.interfaces.dto;

/**
 * DTO entrant — EvenementTourneeRequest (US-032)
 *
 * Recu sur POST /internal/vue-tournee/events depuis svc-tournee.
 *
 * @param eventId    UUID unique de l'evenement (idempotence)
 * @param eventType  COLIS_LIVRE | ECHEC_DECLAREE | TOURNEE_CLOTUREE
 * @param tourneeId  identifiant de la tournee concernee
 * @param livreurId  identifiant du livreur
 * @param colisId    identifiant du colis (null pour TOURNEE_CLOTUREE)
 * @param motif      motif d'echec (null sauf ECHEC_DECLAREE)
 * @param horodatage ISO-8601 de l'evenement
 */
public record EvenementTourneeRequest(
        String eventId,
        String eventType,
        String tourneeId,
        String livreurId,
        String colisId,
        String motif,
        String horodatage
) {}
