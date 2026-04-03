package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.springframework.stereotype.Service;

/**
 * Application Service — Prendre en compte une instruction (BC-03 Supervision — US-015/016).
 *
 * Orchestration :
 * 1. Charger l'instruction depuis le repository.
 * 2. Déléguer la transition ENVOYEE → PRISE_EN_COMPTE à l'Aggregate Root.
 * 3. Persister la mise à jour.
 * 4. Broadcast WebSocket pour mise à jour temps réel W-02.
 *
 * Déclenché quand le livreur appuie sur "VOIR" dans le bandeau M-06 (US-016).
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
@Service
public class PrendreEnCompteInstructionHandler {

    private final InstructionRepository instructionRepository;
    private final TableauDeBordBroadcaster broadcaster;

    public PrendreEnCompteInstructionHandler(
            InstructionRepository instructionRepository,
            TableauDeBordBroadcaster broadcaster
    ) {
        this.instructionRepository = instructionRepository;
        this.broadcaster = broadcaster;
    }

    /**
     * Exécute la commande de transition ENVOYEE → PRISE_EN_COMPTE.
     *
     * @param command contenant instructionId et livreurId
     * @return l'Instruction mise à jour avec statut PRISE_EN_COMPTE
     * @throws InstructionNotFoundException si l'instruction n'existe pas
     * @throws IllegalStateException si la transition est invalide
     */
    public Instruction handle(PrendreEnCompteInstructionCommand command) {
        Instruction instruction = instructionRepository.findById(command.instructionId())
                .orElseThrow(() -> new InstructionNotFoundException(command.instructionId()));

        // Transition domaine — lève IllegalStateException si statut != ENVOYEE
        instruction.prendreEnCompte(command.livreurId());

        // Persister la mise à jour
        Instruction miseAJour = instructionRepository.update(instruction);

        // Broadcast WebSocket pour mise à jour temps réel W-02
        broadcaster.broadcastTableauDeBord();

        return miseAJour;
    }
}
