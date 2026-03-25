package com.docapost.supervision.infrastructure.persistence;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Entité JPA — VueTourneeEntity (BC-03 Supervision — US-011)
 *
 * Représentation persistante du Read Model VueTournee.
 * Mise à jour par les projections et les handlers d'alertes.
 */
@Entity
@Table(name = "vue_tournee")
public class VueTourneeEntity {

    @Id
    @Column(name = "tournee_id", nullable = false)
    private String tourneeId;

    @Column(name = "livreur_nom", nullable = false)
    private String livreurNom;

    @Column(name = "colis_traites", nullable = false)
    private int colisTraites;

    @Column(name = "colis_total", nullable = false)
    private int colisTotal;

    @Column(name = "pourcentage", nullable = false)
    private int pourcentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutTourneeVue statut;

    @Column(name = "derniere_activite")
    private Instant derniereActivite;

    protected VueTourneeEntity() {}

    public VueTourneeEntity(
            String tourneeId,
            String livreurNom,
            int colisTraites,
            int colisTotal,
            int pourcentage,
            StatutTourneeVue statut,
            Instant derniereActivite
    ) {
        this.tourneeId = tourneeId;
        this.livreurNom = livreurNom;
        this.colisTraites = colisTraites;
        this.colisTotal = colisTotal;
        this.pourcentage = pourcentage;
        this.statut = statut;
        this.derniereActivite = derniereActivite;
    }

    // Getters / Setters
    public String getTourneeId() { return tourneeId; }
    public String getLivreurNom() { return livreurNom; }
    public void setLivreurNom(String livreurNom) { this.livreurNom = livreurNom; }
    public int getColisTraites() { return colisTraites; }
    public void setColisTraites(int colisTraites) { this.colisTraites = colisTraites; }
    public int getColisTotal() { return colisTotal; }
    public void setColisTotal(int colisTotal) { this.colisTotal = colisTotal; }
    public int getPourcentage() { return pourcentage; }
    public void setPourcentage(int pourcentage) { this.pourcentage = pourcentage; }
    public StatutTourneeVue getStatut() { return statut; }
    public void setStatut(StatutTourneeVue statut) { this.statut = statut; }
    public Instant getDerniereActivite() { return derniereActivite; }
    public void setDerniereActivite(Instant derniereActivite) { this.derniereActivite = derniereActivite; }
}
