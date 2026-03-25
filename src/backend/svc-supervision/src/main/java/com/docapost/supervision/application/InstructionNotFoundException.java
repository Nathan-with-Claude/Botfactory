package com.docapost.supervision.application;

/**
 * Exception — Instruction introuvable (BC-03 Supervision — US-015).
 *
 * Levée par MarquerInstructionExecuteeHandler quand l'instructionId n'existe pas en base.
 * Mappée vers HTTP 404 dans InstructionController.
 *
 * Source : US-015 — "Suivre l'état d'exécution d'une instruction envoyée à un livreur"
 */
public class InstructionNotFoundException extends RuntimeException {

    public InstructionNotFoundException(String instructionId) {
        super("Instruction introuvable : " + instructionId);
    }
}
