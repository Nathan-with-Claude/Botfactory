package com.docapost.supervision.domain.events;

import com.docapost.supervision.domain.model.TypeInstruction;

import java.time.Instant;

/**
 * Événement de domaine — InstructionEnvoyee (BC-03 Supervision — US-014)
 *
 * Émis par l'Aggregate Instruction lors de la création via la factory envoyer().
 * Historise : instructionId, tourneeId, colisId, superviseurId, type, creneauCible, horodatage.
 *
 * Source : US-014 — "Envoyer une instruction structurée à un livreur"
 */
public record InstructionEnvoyee(
        String instructionId,
        String tourneeId,
        String colisId,
        String superviseurId,
        TypeInstruction type,
        Instant creneauCible,
        Instant horodatage
) {
    public InstructionEnvoyee(
            String instructionId, String tourneeId, String colisId,
            String superviseurId, TypeInstruction type, Instant creneauCible
    ) {
        this(instructionId, tourneeId, colisId, superviseurId, type, creneauCible, Instant.now());
    }
}
