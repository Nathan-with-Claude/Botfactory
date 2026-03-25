package com.docapost.supervision.interfaces.planification.rest;

import com.docapost.supervision.application.planification.*;
import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.domain.planification.model.StatutAffectation;
import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.interfaces.planification.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * PlanificationController — REST Controller BC-07 Planification
 *
 * Routes exposées (toutes sous /api/planification/**) :
 *
 * GET  /api/planification/plans/{date}                    → Plan du jour (W-04) — US-021
 * GET  /api/planification/plans/{date}?statut=NON_AFFECTEE → Plan du jour filtré — US-021
 * GET  /api/planification/tournees/{id}                   → Détail tournée (W-05) — US-022
 * POST /api/planification/tournees/{id}/composition/valider → Valider composition — US-022
 * POST /api/planification/tournees/{id}/affecter          → Affecter livreur+véhicule — US-023
 * POST /api/planification/tournees/{id}/lancer            → Lancer tournée — US-024
 * POST /api/planification/plans/{date}/lancer-toutes      → Lancer toutes les AFFECTEES — US-024 SC3
 *
 * Codes HTTP :
 * - 200 OK, 201 Created, 400 Bad Request, 403 Forbidden, 404 Not Found, 409 Conflict
 *
 * Accès : ROLE_SUPERVISEUR (configuré dans SecurityConfig)
 *
 * Source : US-021, US-022, US-023, US-024
 */
@RestController
@RequestMapping("/api/planification")
public class PlanificationController {

    private static final Logger log = LoggerFactory.getLogger(PlanificationController.class);

    private final ConsulterPlanDuJourHandler consulterPlanDuJourHandler;
    private final ConsulterDetailTourneePlanifieeHandler consulterDetailHandler;
    private final ValiderCompositionHandler validerCompositionHandler;
    private final AffecterLivreurVehiculeHandler affecterHandler;
    private final LancerTourneeHandler lancerTourneeHandler;

    public PlanificationController(
            ConsulterPlanDuJourHandler consulterPlanDuJourHandler,
            ConsulterDetailTourneePlanifieeHandler consulterDetailHandler,
            ValiderCompositionHandler validerCompositionHandler,
            AffecterLivreurVehiculeHandler affecterHandler,
            LancerTourneeHandler lancerTourneeHandler
    ) {
        this.consulterPlanDuJourHandler = consulterPlanDuJourHandler;
        this.consulterDetailHandler = consulterDetailHandler;
        this.validerCompositionHandler = validerCompositionHandler;
        this.affecterHandler = affecterHandler;
        this.lancerTourneeHandler = lancerTourneeHandler;
    }

    /**
     * GET /api/planification/plans/{date}
     * Retourne le plan du jour avec le bandeau résumé et la liste des tournées TMS.
     * Filtre optionnel sur le statut d'affectation.
     *
     * US-021 (W-04 — Vue liste des tournées du matin)
     */
    @GetMapping("/plans/{date}")
    public ResponseEntity<PlanDuJourDTO> getPlanDuJour(
            @PathVariable String date,
            @RequestParam(required = false) String statut
    ) {
        LocalDate localDate;
        try {
            localDate = LocalDate.parse(date);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        StatutAffectation filtreStatut = null;
        if (statut != null && !statut.isBlank()) {
            try {
                filtreStatut = StatutAffectation.valueOf(statut.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        List<TourneePlanifiee> tournees = consulterPlanDuJourHandler.handle(
                new ConsulterPlanDuJourQuery(localDate, filtreStatut)
        );
        List<TourneePlanifieeDTO> dtos = tournees.stream().map(TourneePlanifieeDTO::from).toList();
        return ResponseEntity.ok(PlanDuJourDTO.of(localDate, dtos));
    }

    /**
     * GET /api/planification/tournees/{id}
     * Retourne le détail complet d'une tournée planifiée (composition + anomalies + affectation).
     *
     * US-022 (W-05 — onglet Composition)
     */
    @GetMapping("/tournees/{id}")
    public ResponseEntity<TourneePlanifieeDetailDTO> getDetailTourneePlanifiee(@PathVariable String id) {
        try {
            TourneePlanifiee tournee = consulterDetailHandler.handle(
                    new ConsulterDetailTourneePlanifieeQuery(id)
            );
            return ResponseEntity.ok(TourneePlanifieeDetailDTO.from(tournee));
        } catch (TourneePlanifieeNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/planification/tournees/{id}/composition/valider
     * Valide explicitement la composition d'une tournée. Émet CompositionVerifiee.
     *
     * US-022 (bouton "Valider la vérification" dans W-05)
     */
    @PostMapping("/tournees/{id}/composition/valider")
    public ResponseEntity<TourneePlanifieeDetailDTO> validerComposition(
            @PathVariable String id,
            Authentication authentication
    ) {
        String superviseurId = authentication != null ? authentication.getName() : "superviseur-dev";
        try {
            validerCompositionHandler.handle(new ValiderCompositionCommand(id, superviseurId));
            TourneePlanifiee tournee = consulterDetailHandler.handle(
                    new ConsulterDetailTourneePlanifieeQuery(id)
            );
            return ResponseEntity.ok(TourneePlanifieeDetailDTO.from(tournee));
        } catch (TourneePlanifieeNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/planification/tournees/{id}/affecter
     * Affecte un livreur et un véhicule à une tournée. Émet AffectationEnregistree.
     *
     * US-023 (W-05 — onglet Affectation, bouton "VALIDER L'AFFECTATION")
     *
     * Codes HTTP :
     * - 200 : affectation réussie
     * - 404 : tournée introuvable
     * - 409 : livreur ou véhicule déjà affecté ou tournée déjà lancée
     */
    @PostMapping("/tournees/{id}/affecter")
    public ResponseEntity<TourneePlanifieeDTO> affecterLivreurVehicule(
            @PathVariable String id,
            @RequestBody AffecterRequest request,
            Authentication authentication
    ) {
        String superviseurId = authentication != null ? authentication.getName() : "superviseur-dev";
        try {
            affecterHandler.handle(new AffecterLivreurVehiculeCommand(
                    id, request.livreurId(), request.livreurNom(), request.vehiculeId(), superviseurId
            ));
            TourneePlanifiee tournee = consulterDetailHandler.handle(
                    new ConsulterDetailTourneePlanifieeQuery(id)
            );
            return ResponseEntity.ok(TourneePlanifieeDTO.from(tournee));
        } catch (TourneePlanifieeNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (LivreurDejaAffecteException | VehiculeDejaAffecteException e) {
            return ResponseEntity.status(409).build();
        } catch (com.docapost.supervision.domain.planification.model.PlanificationInvariantException e) {
            return ResponseEntity.status(409).build();
        }
    }

    /**
     * POST /api/planification/tournees/{id}/lancer
     * Lance une tournée affectée. Émet TourneeLancee.
     *
     * US-024 (W-04 bouton "Lancer" ou W-05 bouton "VALIDER ET LANCER")
     *
     * Codes HTTP :
     * - 200 : tournée lancée
     * - 404 : tournée introuvable
     * - 409 : tournée non affectée ou déjà lancée
     */
    @PostMapping("/tournees/{id}/lancer")
    public ResponseEntity<TourneePlanifieeDTO> lancerTournee(
            @PathVariable String id,
            Authentication authentication
    ) {
        String superviseurId = authentication != null ? authentication.getName() : "superviseur-dev";
        try {
            TourneeLancee event = lancerTourneeHandler.handle(new LancerTourneeCommand(id, superviseurId));
            // MVP : log de l'event (simulation bus Kafka → svc-tournee)
            log.info("[BC-07→BC-01] TourneeLancee : codeTms={}, livreurId={}, lanceeLe={}",
                    event.codeTms(), event.livreurId(), event.lanceeLe());

            TourneePlanifiee tournee = consulterDetailHandler.handle(
                    new ConsulterDetailTourneePlanifieeQuery(id)
            );
            return ResponseEntity.ok(TourneePlanifieeDTO.from(tournee));
        } catch (TourneePlanifieeNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (com.docapost.supervision.domain.planification.model.PlanificationInvariantException e) {
            return ResponseEntity.status(409).build();
        }
    }

    /**
     * POST /api/planification/plans/{date}/lancer-toutes
     * Lance toutes les tournées AFFECTEES pour une date donnée. (US-024 SC3)
     *
     * US-024 (W-04 bouton "LANCER TOUTES LES TOURNÉES")
     */
    @PostMapping("/plans/{date}/lancer-toutes")
    public ResponseEntity<LancerToutesResponse> lancerToutesLesTournees(
            @PathVariable String date,
            Authentication authentication
    ) {
        String superviseurId = authentication != null ? authentication.getName() : "superviseur-dev";
        try {
            LocalDate.parse(date); // validation format
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        int nbLancees = lancerTourneeHandler.lancerToutesLesTourneesAffectees(superviseurId);
        return ResponseEntity.ok(LancerToutesResponse.of(nbLancees));
    }
}
