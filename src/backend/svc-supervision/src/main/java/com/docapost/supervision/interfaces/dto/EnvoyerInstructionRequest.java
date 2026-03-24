package com.docapost.supervision.interfaces.dto;

import com.docapost.supervision.domain.model.TypeInstruction;

import java.time.Instant;

/**
 * DTO Request — POST /api/supervision/instructions (US-014)
 *
 * @param tourneeId identifiant de la tournée active
 * @param colisId identifiant du colis (statut A_LIVRER requis côté UI)
 * @param typeInstruction type normalisé : PRIORISER | ANNULER | REPROGRAMMER
 * @param creneauCible ISO-8601 (obligatoire si REPROGRAMMER, null sinon)
 */
public record EnvoyerInstructionRequest(
        String tourneeId,
        String colisId,
        TypeInstruction typeInstruction,
        Instant creneauCible
) {}
