package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.springframework.stereotype.Service;

/**
 * Application Service — Marquer une instruction comme exécutée (BC-03 Supervision — US-015).
 *
 * Orchestration :
 * 1. Charger l'instruction depuis le repository.
 * 2. Déléguer la transition ENVOYEE → EXECUTEE à l'Aggregate Root.
 * 3. Persister la mise à jour (update statut).
 * 4. Broadcast WebSocket pour mise à jour temps réel W-02.
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
@Service
public class MarquerInstructionExecuteeHandler {

    private final InstructionRepository instructionRepository;
    private final TableauDeBordBroadcaster broadcaster;

    public MarquerInstructionExecuteeHandler(
            InstructionRepository instructionRepository,
            TableauDeBordBroadcaster broadcaster
    ) {
        this.instructionRepository = instructionRepository;
        this.broadcaster = broadcaster;
    }

    /**
     * Exécute la commande de transition de statut.
     *
     * @param command contenant instructionId et livreurId
     * @return l'Instruction mise à jour
     * @throws InstructionNotFoundException si l'instruction n'existe pas
     * @throws IllegalStateException si la transition est invalide (ex : déjà EXECUTEE)
     */
    public Instruction handle(MarquerInstructionExecuteeCommand command) {
        Instruction instruction = instructionRepository.findById(command.instructionId())
                .orElseThrow(() -> new InstructionNotFoundException(command.instructionId()));

        // Transition domaine — lève IllegalStateException si statut != ENVOYEE
        instruction.marquerExecutee(command.livreurId());

        // Persister la mise à jour
        Instruction mise_a_jour = instructionRepository.update(instruction);

        // Événements collectés (collect-and-publish — Kafka Sprint 3)
        mise_a_jour.clearEvenements();

        // Broadcast WebSocket pour mise à jour temps réel W-02
        broadcaster.broadcastTableauDeBord();

        return mise_a_jour;
    }
}
