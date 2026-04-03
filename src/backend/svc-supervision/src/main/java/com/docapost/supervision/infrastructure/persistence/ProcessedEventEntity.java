package com.docapost.supervision.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Entite JPA — ProcessedEventEntity (US-032)
 *
 * Table d'idempotence pour les evenements recus depuis svc-tournee.
 * Un eventId deja present indique que l'evenement a deja ete traite
 * et ne doit pas etre rejoue.
 *
 * Table : processed_events
 */
@Entity
@Table(name = "processed_events")
public class ProcessedEventEntity {

    @Id
    @Column(name = "event_id", nullable = false, length = 36)
    private String eventId;

    @Column(name = "processed_at", nullable = false)
    private Instant processedAt;

    protected ProcessedEventEntity() {}

    public ProcessedEventEntity(String eventId, Instant processedAt) {
        this.eventId = eventId;
        this.processedAt = processedAt;
    }

    public String getEventId() { return eventId; }
    public Instant getProcessedAt() { return processedAt; }
}
