package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application Service — Consulter les instructions d'une tournée (BC-03 Supervision — US-015).
 *
 * Retourne toutes les instructions d'une tournée triées par horodatage décroissant.
 * Utilisé par l'onglet "Instructions" de l'écran W-02.
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
@Service
public class ConsulterInstructionsParTourneeHandler {

    private final InstructionRepository instructionRepository;

    public ConsulterInstructionsParTourneeHandler(InstructionRepository instructionRepository) {
        this.instructionRepository = instructionRepository;
    }

    /**
     * @param query contenant le tourneeId
     * @return liste des instructions triées par horodatage décroissant
     */
    public List<Instruction> handle(ConsulterInstructionsParTourneeQuery query) {
        return instructionRepository.findByTourneeId(query.tourneeId());
    }
}
