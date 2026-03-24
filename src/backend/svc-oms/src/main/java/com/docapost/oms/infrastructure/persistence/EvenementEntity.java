package com.docapost.oms.infrastructure.persistence;

import com.docapost.oms.domain.model.StatutSynchronisation;
import com.docapost.oms.domain.model.TypeEvenement;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Entité JPA — Event Store append-only (US-018).
 *
 * Politique append-only :
 * - Aucun @Modifying query sur les colonnes métier (event_id, livreur_id, type, etc.).
 * - Seuls statut_synchronisation et tentatives_synchronisation sont modifiables
 *   (nécessaire pour l'outbox pattern US-017).
 * - Au niveau base de données, une contrainte UNIQUE sur event_id garantit l'idempotence.
 */
@Entity
@Table(name = "evenement_livraison",
        uniqueConstraints = @UniqueConstraint(name = "uk_event_id", columnNames = "event_id"))
public class EvenementEntity {

    @Id
    @Column(name = "event_id", nullable = false, updatable = false)
    private String eventId;

    @Column(name = "tournee_id", nullable = false, updatable = false)
    private String tourneeId;

    @Column(name = "colis_id", updatable = false)
    private String colisId;

    @Column(name = "livreur_id", nullable = false, updatable = false)
    private String livreurId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, updatable = false)
    private TypeEvenement type;

    @Column(name = "horodatage", nullable = false, updatable = false)
    private Instant horodatage;

    @Column(name = "latitude", updatable = false)
    private Double latitude;

    @Column(name = "longitude", updatable = false)
    private Double longitude;

    @Column(name = "mode_degrad_gps", nullable = false, updatable = false)
    private boolean modeDegradGPS;

    @Column(name = "preuve_livraison_id", updatable = false)
    private String preuveLivraisonId;

    @Column(name = "motif_echec", updatable = false)
    private String motifEchec;

    // Seuls champs mutables — outbox pattern
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_synchronisation", nullable = false)
    private StatutSynchronisation statutSynchronisation;

    @Column(name = "tentatives_synchronisation", nullable = false)
    private int tentativesSynchronisation;

    protected EvenementEntity() {}

    public EvenementEntity(String eventId, String tourneeId, String colisId, String livreurId,
                           TypeEvenement type, Instant horodatage,
                           Double latitude, Double longitude, boolean modeDegradGPS,
                           String preuveLivraisonId, String motifEchec,
                           StatutSynchronisation statutSynchronisation, int tentativesSynchronisation) {
        this.eventId = eventId;
        this.tourneeId = tourneeId;
        this.colisId = colisId;
        this.livreurId = livreurId;
        this.type = type;
        this.horodatage = horodatage;
        this.latitude = latitude;
        this.longitude = longitude;
        this.modeDegradGPS = modeDegradGPS;
        this.preuveLivraisonId = preuveLivraisonId;
        this.motifEchec = motifEchec;
        this.statutSynchronisation = statutSynchronisation;
        this.tentativesSynchronisation = tentativesSynchronisation;
    }

    public String getEventId() { return eventId; }
    public String getTourneeId() { return tourneeId; }
    public String getColisId() { return colisId; }
    public String getLivreurId() { return livreurId; }
    public TypeEvenement getType() { return type; }
    public Instant getHorodatage() { return horodatage; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public boolean isModeDegradGPS() { return modeDegradGPS; }
    public String getPreuveLivraisonId() { return preuveLivraisonId; }
    public String getMotifEchec() { return motifEchec; }
    public StatutSynchronisation getStatutSynchronisation() { return statutSynchronisation; }
    public int getTentativesSynchronisation() { return tentativesSynchronisation; }

    public void setStatutSynchronisation(StatutSynchronisation statut) {
        this.statutSynchronisation = statut;
    }

    public void setTentativesSynchronisation(int tentatives) {
        this.tentativesSynchronisation = tentatives;
    }
}
