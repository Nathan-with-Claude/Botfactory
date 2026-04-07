package com.docapost.supervision.interfaces.rest;

import com.docapost.supervision.application.EvenementTourneeCommand;
import com.docapost.supervision.application.VueTourneeEventHandler;
import com.docapost.supervision.interfaces.dto.EvenementTourneeRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST interne — EvenementTourneeController (US-032)
 *
 * Reçoit les événements livreur émis par svc-tournee (via SupervisionNotifier)
 * et délègue au VueTourneeEventHandler pour mettre à jour le read model BC-03.
 *
 * Endpoint : POST /api/supervision/internal/vue-tournee/events
 *
 * Accessible sans authentification utilisateur (appel inter-services).
 * Protégé par le réseau interne uniquement (pas de JWT requis — cf. SecurityConfig).
 *
 * Idempotence : garantie par VueTourneeEventHandler via la table processed_events.
 *
 * Source : US-032 — "Synchroniser le read model supervision"
 */
@RestController
@RequestMapping("/api/supervision/internal")
public class EvenementTourneeController {

    private final VueTourneeEventHandler vueTourneeEventHandler;

    public EvenementTourneeController(VueTourneeEventHandler vueTourneeEventHandler) {
        this.vueTourneeEventHandler = vueTourneeEventHandler;
    }

    /**
     * POST /api/supervision/internal/vue-tournee/events
     *
     * Corps de requête : EvenementTourneeRequest
     * - eventId    : UUID unique (idempotence)
     * - eventType  : COLIS_LIVRE | ECHEC_DECLAREE | TOURNEE_CLOTUREE
     * - tourneeId  : identifiant de la tournée
     * - livreurId  : identifiant du livreur
     * - colisId    : identifiant du colis (null pour TOURNEE_CLOTUREE)
     * - motif      : motif d'échec (null sauf ECHEC_DECLAREE)
     * - horodatage : ISO-8601
     *
     * @return 204 No Content si traité (ou déjà traité — idempotent)
     */
    @PostMapping("/vue-tournee/events")
    public ResponseEntity<Void> recevoirEvenement(@RequestBody EvenementTourneeRequest request) {
        EvenementTourneeCommand command = new EvenementTourneeCommand(
                request.eventId(),
                request.eventType(),
                request.tourneeId(),
                request.livreurId(),
                request.colisId(),
                request.motif(),
                request.horodatage()
        );
        vueTourneeEventHandler.handle(command);
        return ResponseEntity.noContent().build();
    }
}
