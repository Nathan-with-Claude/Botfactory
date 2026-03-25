package com.docapost.oms.interfaces.rest;

import com.docapost.oms.application.*;
import com.docapost.oms.interfaces.dto.EnregistrerEvenementRequest;
import com.docapost.oms.interfaces.dto.EvenementDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller — Event Store BC-05 (US-017 + US-018).
 *
 * Endpoints :
 * POST   /api/oms/evenements                    — enregistrer un événement (US-018)
 * GET    /api/oms/evenements/colis/{colisId}    — historique d'un colis (US-018)
 * GET    /api/oms/evenements/tournee/{tourneeId} — historique d'une tournée (US-018)
 *
 * Sécurité (profil dev) : MockJwtAuthFilter injecte ROLE_SUPERVISEUR + ROLE_SYSTEME.
 */
@RestController
@RequestMapping("/api/oms/evenements")
public class EvenementController {

    private final EnregistrerEvenementHandler enregistrerHandler;
    private final ConsulterHistoriqueColisHandler historiqueColisHandler;
    private final ConsulterHistoriqueTourneeHandler historiqueTourneeHandler;

    public EvenementController(
            EnregistrerEvenementHandler enregistrerHandler,
            ConsulterHistoriqueColisHandler historiqueColisHandler,
            ConsulterHistoriqueTourneeHandler historiqueTourneeHandler
    ) {
        this.enregistrerHandler = enregistrerHandler;
        this.historiqueColisHandler = historiqueColisHandler;
        this.historiqueTourneeHandler = historiqueTourneeHandler;
    }

    /**
     * POST /api/oms/evenements — Enregistrer un événement dans l'Event Store.
     * Retourne 201 Created avec le DTO de l'événement créé (incl. modeDegradGPS),
     * ou 409 si l'eventId existe déjà (idempotence US-017 SC3).
     */
    @PostMapping
    public ResponseEntity<?> enregistrer(@RequestBody EnregistrerEvenementRequest req) {
        try {
            var evenement = enregistrerHandler.handle(new EnregistrerEvenementCommand(
                    req.eventId(), req.tourneeId(), req.colisId(), req.livreurId(),
                    req.type(), req.horodatage(),
                    req.latitude(), req.longitude(),
                    req.preuveLivraisonId(), req.motifEchec()
            ));
            return ResponseEntity.status(HttpStatus.CREATED).body(EvenementDTO.from(evenement));
        } catch (EvenementDejaExistantException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * GET /api/oms/evenements/colis/{colisId} — Historique complet d'un colis pour audit.
     * Retourne les événements en ordre chronologique ascendant (US-018 SC3).
     */
    @GetMapping("/colis/{colisId}")
    public ResponseEntity<List<EvenementDTO>> historiqueColis(@PathVariable String colisId) {
        List<EvenementDTO> evenements = historiqueColisHandler
                .handle(new ConsulterHistoriqueColisQuery(colisId))
                .stream().map(EvenementDTO::from).toList();
        return ResponseEntity.ok(evenements);
    }

    /**
     * GET /api/oms/evenements/tournee/{tourneeId} — Historique complet d'une tournée.
     */
    @GetMapping("/tournee/{tourneeId}")
    public ResponseEntity<List<EvenementDTO>> historiqueTournee(@PathVariable String tourneeId) {
        List<EvenementDTO> evenements = historiqueTourneeHandler
                .handle(new ConsulterHistoriqueTourneeQuery(tourneeId))
                .stream().map(EvenementDTO::from).toList();
        return ResponseEntity.ok(evenements);
    }
}
