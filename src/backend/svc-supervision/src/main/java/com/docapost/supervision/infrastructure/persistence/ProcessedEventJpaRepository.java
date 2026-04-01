package com.docapost.supervision.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA Repository pour ProcessedEventEntity (US-032).
 *
 * Utilise existsById(eventId) pour le check d'idempotence (O(1) via PK).
 */
public interface ProcessedEventJpaRepository extends JpaRepository<ProcessedEventEntity, String> {
}
