package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.Instruction;
import com.docapost.supervision.domain.model.StatutInstruction;
import com.docapost.supervision.domain.model.TypeInstruction;

import java.time.Instant;

/**
 * DTO Response — Instruction créée (US-014)
 *
 * Retourné avec HTTP 201 après POST /api/supervision/instructions.
 */
public record InstructionCreeDTO(
        String instructionId,
        String tourneeId,
        String colisId,
        String superviseurId,
        TypeInstruction typeInstruction,
        Instant creneauCible,
        StatutInstruction statut,
        Instant horodatage
) {
    public static InstructionCreeDTO from(Instruction instruction) {
        return new InstructionCreeDTO(
                instruction.getInstructionId(),
                instruction.getTourneeId(),
                instruction.getColisId(),
                instruction.getSuperviseurId(),
                instruction.getType(),
                instruction.getCreneauCible(),
                instruction.getStatut(),
                instruction.getHorodatage()
        );
    }
}
