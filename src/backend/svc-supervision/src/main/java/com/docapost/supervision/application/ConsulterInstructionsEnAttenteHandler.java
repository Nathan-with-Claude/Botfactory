package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application Service — Consulter les instructions ENVOYEE d'une tournée (BC-03/BC-04 — US-016).
 *
 * Utilisé par le polling mobile du livreur.
 * Retourne uniquement les instructions au statut ENVOYEE (non encore exécutées).
 *
 * TODO Sprint 3 : remplacer par push FCM via KafkaConsumer InstructionEnvoyeeListener.
 *
 * Source : US-016 — "Recevoir une notification push quand le superviseur modifie ma tournée"
 */
@Service
public class ConsulterInstructionsEnAttenteHandler {

    private final InstructionRepository instructionRepository;

    public ConsulterInstructionsEnAttenteHandler(InstructionRepository instructionRepository) {
        this.instructionRepository = instructionRepository;
    }

    /**
     * @param query contenant le tourneeId du livreur
     * @return liste des instructions ENVOYEE pour cette tournée
     */
    public List<Instruction> handle(ConsulterInstructionsEnAttenteQuery query) {
        return instructionRepository.findEnAttenteParTournee(query.tourneeId());
    }
}
