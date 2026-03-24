package com.docapost.supervision.infrastructure.persistence;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * Entité JPA — IncidentVueEntity (BC-03 Supervision — US-012)
 *
 * Vue persistante d'un incident (échec de livraison) pour le détail tournée.
 */
@Entity
@Table(name = "incident_vue")
public class IncidentVueEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tournee_id", nullable = false)
    private String tourneeId;

    @Column(name = "colis_id", nullable = false)
    private String colisId;

    @Column(name = "adresse", nullable = false)
    private String adresse;

    @Column(name = "motif", nullable = false)
    private String motif;

    @Column(name = "horodatage", nullable = false)
    private Instant horodatage;

    @Column(name = "note")
    private String note;

    protected IncidentVueEntity() {}

    public IncidentVueEntity(String tourneeId, String colisId, String adresse,
                              String motif, Instant horodatage, String note) {
        this.tourneeId = tourneeId;
        this.colisId = colisId;
        this.adresse = adresse;
        this.motif = motif;
        this.horodatage = horodatage;
        this.note = note;
    }

    public Long getId() { return id; }
    public String getTourneeId() { return tourneeId; }
    public String getColisId() { return colisId; }
    public String getAdresse() { return adresse; }
    public String getMotif() { return motif; }
    public Instant getHorodatage() { return horodatage; }
    public String getNote() { return note; }
}
