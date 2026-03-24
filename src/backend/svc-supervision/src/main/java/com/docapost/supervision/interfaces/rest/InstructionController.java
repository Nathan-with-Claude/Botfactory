package com.docapost.supervision.interfaces.rest;

import com.docapost.supervision.application.*;
import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.interfaces.dto.EnvoyerInstructionRequest;
import com.docapost.supervision.interfaces.dto.InstructionCreeDTO;
import com.docapost.supervision.interfaces.dto.InstructionDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST — Instructions (BC-03 Supervision — US-014)
 *
 * POST /api/supervision/instructions
 *   - Envoie une instruction normalisée à un livreur
 *   - Retourne 201 Created avec InstructionCreeDTO
 *   - 409 si instruction déjà en attente pour ce colis
 *   - 422 si REPROGRAMMER sans créneau cible (IllegalArgumentException)
 *   - 403 si non ROLE_SUPERVISEUR
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
@RestController
@RequestMapping("/api/supervision/instructions")
public class InstructionController {

    private final EnvoyerInstructionHandler envoyerInstructionHandler;
    private final MarquerInstructionExecuteeHandler marquerExecuteeHandler;
    private final ConsulterInstructionsParTourneeHandler consulterParTourneeHandler;
    private final ConsulterInstructionsEnAttenteHandler consulterEnAttenteHandler;

    public InstructionController(
            EnvoyerInstructionHandler envoyerInstructionHandler,
            MarquerInstructionExecuteeHandler marquerExecuteeHandler,
            ConsulterInstructionsParTourneeHandler consulterParTourneeHandler,
            ConsulterInstructionsEnAttenteHandler consulterEnAttenteHandler
    ) {
        this.envoyerInstructionHandler = envoyerInstructionHandler;
        this.marquerExecuteeHandler = marquerExecuteeHandler;
        this.consulterParTourneeHandler = consulterParTourneeHandler;
        this.consulterEnAttenteHandler = consulterEnAttenteHandler;
    }

    /**
     * POST /api/supervision/instructions
     *
     * @param request corps de la requête (tourneeId, colisId, typeInstruction, creneauCible)
     * @param auth authentification Spring Security (superviseurId extrait du JWT)
     * @return 201 avec InstructionCreeDTO | 409 | 422 | 403
     */
    @PostMapping
    public ResponseEntity<InstructionCreeDTO> envoyerInstruction(
            @RequestBody EnvoyerInstructionRequest request,
            Authentication auth
    ) {
        String superviseurId = auth != null ? auth.getName() : "superviseur-anonyme";

        try {
            EnvoyerInstructionCommand command = new EnvoyerInstructionCommand(
                    request.tourneeId(),
                    request.colisId(),
                    superviseurId,
                    request.typeInstruction(),
                    request.creneauCible()
            );
            Instruction instruction = envoyerInstructionHandler.handle(command);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(InstructionCreeDTO.from(instruction));

        } catch (InstructionDejaEnAttenteException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();
        }
    }

    /**
     * GET /api/supervision/instructions/tournee/{tourneeId}
     *
     * Retourne toutes les instructions d'une tournée (onglet "Instructions" W-02).
     * Accessible : SUPERVISEUR uniquement.
     *
     * @return 200 + liste InstructionDTO triée par horodatage décroissant | 403
     */
    @GetMapping("/tournee/{tourneeId}")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public ResponseEntity<List<InstructionDTO>> consulterInstructionsParTournee(
            @PathVariable String tourneeId
    ) {
        List<InstructionDTO> instructions = consulterParTourneeHandler
                .handle(new ConsulterInstructionsParTourneeQuery(tourneeId))
                .stream()
                .map(InstructionDTO::from)
                .toList();
        return ResponseEntity.ok(instructions);
    }

    /**
     * PATCH /api/supervision/instructions/{instructionId}/executer
     *
     * Marque une instruction comme exécutée par le livreur.
     * Déclenchée depuis l'application mobile quand Pierre consulte M-03.
     * Accessible : LIVREUR et SUPERVISEUR.
     *
     * @return 200 + InstructionDTO mise à jour | 404 | 409 (transition invalide)
     */
    @PatchMapping("/{instructionId}/executer")
    @PreAuthorize("hasRole('LIVREUR') or hasRole('SUPERVISEUR')")
    public ResponseEntity<InstructionDTO> marquerExecutee(
            @PathVariable String instructionId,
            Authentication auth
    ) {
        String livreurId = auth != null ? auth.getName() : "livreur-anonyme";
        try {
            Instruction instruction = marquerExecuteeHandler.handle(
                    new MarquerInstructionExecuteeCommand(instructionId, livreurId)
            );
            return ResponseEntity.ok(InstructionDTO.from(instruction));
        } catch (InstructionNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * GET /api/supervision/instructions/en-attente?tourneeId={tourneeId}
     *
     * Retourne les instructions ENVOYEE pour une tournée — polling mobile (US-016).
     * Accessible : LIVREUR et SUPERVISEUR.
     * TODO Sprint 3 : remplacer par push FCM.
     *
     * @return 200 + liste InstructionDTO (peut être vide)
     */
    @GetMapping("/en-attente")
    @PreAuthorize("hasRole('LIVREUR') or hasRole('SUPERVISEUR')")
    public ResponseEntity<List<InstructionDTO>> consulterEnAttente(
            @RequestParam String tourneeId
    ) {
        List<InstructionDTO> instructions = consulterEnAttenteHandler
                .handle(new ConsulterInstructionsEnAttenteQuery(tourneeId))
                .stream()
                .map(InstructionDTO::from)
                .toList();
        return ResponseEntity.ok(instructions);
    }
}
