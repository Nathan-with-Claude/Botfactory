package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.TypeInstruction;

import java.time.Instant;

/**
 * Commande — Envoyer une instruction à un livreur (US-014)
 *
 * @param tourneeId identifiant de la tournée active
 * @param colisId identifiant du colis concerné (statut A_LIVRER requis côté UI)
 * @param superviseurId identifiant du superviseur émetteur (extrait du JWT)
 * @param typeInstruction type normalisé (PRIORISER | ANNULER | REPROGRAMMER)
 * @param creneauCible créneau cible ISO-8601 (obligatoire si REPROGRAMMER, null sinon)
 */
public record EnvoyerInstructionCommand(
        String tourneeId,
        String colisId,
        String superviseurId,
        TypeInstruction typeInstruction,
        Instant creneauCible
) {}
