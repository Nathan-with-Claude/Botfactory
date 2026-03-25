package com.docapost.supervision.infrastructure.planification;

import com.docapost.supervision.domain.planification.model.StatutAffectation;
import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDate;

/**
 * TourneePlanifieeEntity — Entité JPA BC-07 Planification
 *
 * Représentation persistante de l'Aggregate TourneePlanifiee.
 * Les zones, contraintes et anomalies sont sérialisées en JSON (colonne TEXT).
 *
 * Source : US-021, US-022, US-023, US-024
 */
@Entity
@Table(name = "tournee_planifiee")
public class TourneePlanifieeEntity {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "code_tms", nullable = false)
    private String codeTms;

    @Column(name = "date_tournee", nullable = false)
    private LocalDate date;

    @Column(name = "nb_colis", nullable = false)
    private int nbColis;

    /** JSON sérialisé des zones : [{nom:"Lyon 3e", nbColis:20}, ...] */
    @Column(name = "zones_json", columnDefinition = "TEXT")
    private String zonesJson;

    /** JSON sérialisé des contraintes horaires */
    @Column(name = "contraintes_json", columnDefinition = "TEXT")
    private String contraintesJson;

    /** JSON sérialisé des anomalies détectées */
    @Column(name = "anomalies_json", columnDefinition = "TEXT")
    private String anomaliesJson;

    @Column(name = "importee_le", nullable = false)
    private Instant importeeLe;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutAffectation statut;

    @Column(name = "livreur_id")
    private String livreurId;

    @Column(name = "livreur_nom")
    private String livreurNom;

    @Column(name = "vehicule_id")
    private String vehiculeId;

    @Column(name = "affectee_le")
    private Instant affecteeLe;

    @Column(name = "lancee")
    private Instant lancee;

    @Column(name = "composition_verifiee", nullable = false)
    private boolean compositionVerifiee;

    protected TourneePlanifieeEntity() {}

    public TourneePlanifieeEntity(
            String id, String codeTms, LocalDate date, int nbColis,
            String zonesJson, String contraintesJson, String anomaliesJson,
            Instant importeeLe, StatutAffectation statut,
            String livreurId, String livreurNom, String vehiculeId,
            Instant affecteeLe, Instant lancee, boolean compositionVerifiee
    ) {
        this.id = id;
        this.codeTms = codeTms;
        this.date = date;
        this.nbColis = nbColis;
        this.zonesJson = zonesJson;
        this.contraintesJson = contraintesJson;
        this.anomaliesJson = anomaliesJson;
        this.importeeLe = importeeLe;
        this.statut = statut;
        this.livreurId = livreurId;
        this.livreurNom = livreurNom;
        this.vehiculeId = vehiculeId;
        this.affecteeLe = affecteeLe;
        this.lancee = lancee;
        this.compositionVerifiee = compositionVerifiee;
    }

    // Getters et Setters
    public String getId() { return id; }
    public String getCodeTms() { return codeTms; }
    public LocalDate getDate() { return date; }
    public int getNbColis() { return nbColis; }
    public String getZonesJson() { return zonesJson; }
    public String getContraintesJson() { return contraintesJson; }
    public String getAnomaliesJson() { return anomaliesJson; }
    public Instant getImporteeLe() { return importeeLe; }
    public StatutAffectation getStatut() { return statut; }
    public void setStatut(StatutAffectation statut) { this.statut = statut; }
    public String getLivreurId() { return livreurId; }
    public void setLivreurId(String livreurId) { this.livreurId = livreurId; }
    public String getLivreurNom() { return livreurNom; }
    public void setLivreurNom(String livreurNom) { this.livreurNom = livreurNom; }
    public String getVehiculeId() { return vehiculeId; }
    public void setVehiculeId(String vehiculeId) { this.vehiculeId = vehiculeId; }
    public Instant getAffecteeLe() { return affecteeLe; }
    public void setAffecteeLe(Instant affecteeLe) { this.affecteeLe = affecteeLe; }
    public Instant getLancee() { return lancee; }
    public void setLancee(Instant lancee) { this.lancee = lancee; }
    public boolean isCompositionVerifiee() { return compositionVerifiee; }
    public void setCompositionVerifiee(boolean compositionVerifiee) { this.compositionVerifiee = compositionVerifiee; }
}
