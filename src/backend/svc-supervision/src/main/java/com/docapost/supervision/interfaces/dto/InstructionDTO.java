package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.Instruction;

import java.time.Instant;

/**
 * DTO — Instruction (BC-03 Supervision — US-015).
 *
 * Représente une instruction dans la liste de l'onglet "Instructions" (W-02)
 * et dans la réponse du polling mobile (US-016).
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
public record InstructionDTO(
        String instructionId,
        String tourneeId,
        String colisId,
        String superviseurId,
        String typeInstruction,
        String statut,
        Instant creneauCible,
        Instant horodatage
) {
    public static InstructionDTO from(Instruction instruction) {
        return new InstructionDTO(
                instruction.getInstructionId(),
                instruction.getTourneeId(),
                instruction.getColisId(),
                instruction.getSuperviseurId(),
                instruction.getType().name(),
                instruction.getStatut().name(),
                instruction.getCreneauCible(),
                instruction.getHorodatage()
        );
    }
}
