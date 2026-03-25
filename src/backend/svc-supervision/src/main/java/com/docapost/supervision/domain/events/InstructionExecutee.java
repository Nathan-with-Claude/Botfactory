package com.docapost.supervision.domain.events;

import java.time.Instant;

/**
 * Domain Event — InstructionExecutee (BC-03 Supervision — US-015)
 *
 * Emis par Instruction.marquerExecutee() quand le livreur exécute l'instruction.
 * Transition : ENVOYEE → EXECUTEE.
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
public record InstructionExecutee(
        String instructionId,
        String tourneeId,
        String colisId,
        String livreurId,
        Instant horodatage
) {
    public InstructionExecutee(String instructionId, String tourneeId, String colisId, String livreurId) {
        this(instructionId, tourneeId, colisId, livreurId, Instant.now());
    }
}
