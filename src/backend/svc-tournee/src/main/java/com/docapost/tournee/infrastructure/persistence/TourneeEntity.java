package com.docapost.tournee.infrastructure.persistence;

import com.docapost.tournee.domain.model.StatutTournee;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity — Projection persistee de l'agregat Tournee.
 * Separee volontairement de l'agregat domain pour respecter le principe
 * d'independance entre infrastructure et domain.
 *
 * Note : schema auto-cree en profil dev (H2). En prod : schema verse via Flyway.
 */
@Entity
@Table(name = "tournees",
        uniqueConstraints = @UniqueConstraint(columnNames = {"livreur_id", "date"}))
public class TourneeEntity {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @Column(name = "livreur_id", nullable = false, length = 100)
    private String livreurId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutTournee statut;

    @OneToMany(mappedBy = "tournee", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<ColisEntity> colis = new ArrayList<>();

    protected TourneeEntity() {}

    public TourneeEntity(String id, String livreurId, LocalDate date, StatutTournee statut) {
        this.id = id;
        this.livreurId = livreurId;
        this.date = date;
        this.statut = statut;
    }

    // ─── Getters / Setters ────────────────────────────────────────────────────

    public String getId() { return id; }
    public String getLivreurId() { return livreurId; }
    public LocalDate getDate() { return date; }
    public StatutTournee getStatut() { return statut; }
    public void setStatut(StatutTournee statut) { this.statut = statut; }
    public List<ColisEntity> getColis() { return colis; }
    public void setColis(List<ColisEntity> colis) { this.colis = colis; }
}
