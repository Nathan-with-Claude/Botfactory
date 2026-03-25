package com.docapost.supervision.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Spring Data JPA Repository pour IncidentVueEntity (US-012).
 */
public interface IncidentVueJpaRepository extends JpaRepository<IncidentVueEntity, Long> {

    List<IncidentVueEntity> findByTourneeId(String tourneeId);
}
