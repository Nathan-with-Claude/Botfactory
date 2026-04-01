package com.docapost.supervision.infrastructure.persistence;

import com.docapost.supervision.domain.model.StatutInstruction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Spring Data JPA Repository pour InstructionEntity (US-014).
 */
public interface InstructionJpaRepository extends JpaRepository<InstructionEntity, String> {

    /**
     * Recherche une instruction par colisId et statut.
     * Utilisé pour l'invariant "une seule instruction en attente par colis".
     */
    Optional<InstructionEntity> findByColisIdAndStatut(String colisId, StatutInstruction statut);

    /**
     * Retourne toutes les instructions d'une tournée, triées par horodatage décroissant.
     */
    java.util.List<InstructionEntity> findByTourneeIdOrderByHorodatageDesc(String tourneeId);

    /**
     * Retourne les instructions ENVOYEE pour une tournée — utilisé pour le polling (US-016).
     */
    java.util.List<InstructionEntity> findByTourneeIdAndStatut(String tourneeId, StatutInstruction statut);

    /**
     * Retourne les instructions avec un statut parmi la liste fournie — US-015.
     */
    java.util.List<InstructionEntity> findByTourneeIdAndStatutIn(String tourneeId, java.util.List<StatutInstruction> statuts);
}
