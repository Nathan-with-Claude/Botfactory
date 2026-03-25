package com.docapost.supervision.application;

/**
 * Command — Marquer une instruction comme exécutée (BC-03 Supervision — US-015).
 *
 * Déclenchée depuis l'application mobile du livreur quand il consulte
 * le détail d'un colis associé à une instruction ENVOYEE.
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
public record MarquerInstructionExecuteeCommand(
        String instructionId,
        String livreurId
) {}
