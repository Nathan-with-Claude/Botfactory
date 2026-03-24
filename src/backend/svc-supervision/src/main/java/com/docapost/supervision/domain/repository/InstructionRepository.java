package com.docapost.supervision.domain.repository;

import com.docapost.supervision.domain.model.Instruction;

import java.util.List;
import java.util.Optional;

/**
 * Port — Repository des Instructions (BC-03 Supervision — US-014/015/016).
 * Interface dans le domaine, implémentation dans l'infrastructure.
 *
 * Source : Architecture hexagonale DDD — séparation port/adapter.
 */
public interface InstructionRepository {

    /**
     * Sauvegarde une instruction (création uniquement dans le MVP).
     */
    Instruction save(Instruction instruction);

    /**
     * Met à jour le statut d'une instruction existante (US-015).
     */
    Instruction update(Instruction instruction);

    /**
     * Recherche une instruction par son identifiant (US-015).
     */
    Optional<Instruction> findById(String instructionId);

    /**
     * Recherche une instruction au statut ENVOYEE pour un colisId donné.
     * Invariant : un colis ne peut avoir qu'une instruction en attente.
     */
    Optional<Instruction> findInstructionEnAttenteParColis(String colisId);

    /**
     * Retourne toutes les instructions d'une tournée, triées par horodatage décroissant (US-015).
     */
    List<Instruction> findByTourneeId(String tourneeId);

    /**
     * Retourne les instructions ENVOYEE pour une tournée — polling mobile (US-016).
     */
    List<Instruction> findEnAttenteParTournee(String tourneeId);
}
