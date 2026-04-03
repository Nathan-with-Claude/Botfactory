package com.docapost.supervision.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Spring Data JPA Repository pour VueColisEntity (US-012).
 */
public interface VueColisJpaRepository extends JpaRepository<VueColisEntity, Long> {

    List<VueColisEntity> findByTourneeId(String tourneeId);

    java.util.Optional<VueColisEntity> findByTourneeIdAndColisId(String tourneeId, String colisId);
}
