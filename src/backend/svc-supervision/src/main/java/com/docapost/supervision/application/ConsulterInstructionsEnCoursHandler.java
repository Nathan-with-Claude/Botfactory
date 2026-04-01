package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.repository.InstructionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application Service — Consulter les instructions en cours (ENVOYEE | PRISE_EN_COMPTE)
 * d'une tournée (BC-03 — Bug 1 US-015).
 *
 * Utilisé par le polling mobile de l'écran M-03 (DetailColisScreen).
 * Retourne les instructions actives, c'est-à-dire celles que le livreur doit encore exécuter.
 * Contrairement à ConsulterInstructionsEnAttenteHandler (US-016), inclut aussi PRISE_EN_COMPTE
 * afin que la section "Consigne en cours" reste visible après acceptation du bandeau.
 *
 * Source : Bug 1 — US-015 "Suivre l'état d'exécution d'une instruction"
 */
@Service
public class ConsulterInstructionsEnCoursHandler {

    private final InstructionRepository instructionRepository;

    public ConsulterInstructionsEnCoursHandler(InstructionRepository instructionRepository) {
        this.instructionRepository = instructionRepository;
    }

    /**
     * @param query contenant le tourneeId du livreur
     * @return liste des instructions ENVOYEE ou PRISE_EN_COMPTE pour cette tournée
     */
    public List<Instruction> handle(ConsulterInstructionsEnCoursQuery query) {
        return instructionRepository.findEnCoursParTournee(query.tourneeId());
    }
}
