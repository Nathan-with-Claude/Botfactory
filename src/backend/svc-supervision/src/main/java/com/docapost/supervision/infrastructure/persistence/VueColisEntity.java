package com.docapost.supervision.infrastructure.persistence;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * Entité JPA — VueColisEntity (BC-03 Supervision — US-012)
 *
 * Vue persistante d'un colis pour l'écran détail tournée superviseur (W-02).
 */
@Entity
@Table(name = "vue_colis")
public class VueColisEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tournee_id", nullable = false)
    private String tourneeId;

    @Column(name = "colis_id", nullable = false)
    private String colisId;

    @Column(name = "adresse", nullable = false)
    private String adresse;

    @Column(name = "statut", nullable = false)
    private String statut;

    @Column(name = "motif_echec")
    private String motifEchec;

    @Column(name = "horodatage_traitement")
    private Instant horodatageTraitement;

    protected VueColisEntity() {}

    public VueColisEntity(String tourneeId, String colisId, String adresse, String statut,
                           String motifEchec, Instant horodatageTraitement) {
        this.tourneeId = tourneeId;
        this.colisId = colisId;
        this.adresse = adresse;
        this.statut = statut;
        this.motifEchec = motifEchec;
        this.horodatageTraitement = horodatageTraitement;
    }

    public Long getId() { return id; }
    public String getTourneeId() { return tourneeId; }
    public String getColisId() { return colisId; }
    public String getAdresse() { return adresse; }
    public String getStatut() { return statut; }
    public String getMotifEchec() { return motifEchec; }
    public Instant getHorodatageTraitement() { return horodatageTraitement; }
    public void setStatut(String statut) { this.statut = statut; }
    public void setMotifEchec(String motifEchec) { this.motifEchec = motifEchec; }
    public void setHorodatageTraitement(Instant horodatageTraitement) { this.horodatageTraitement = horodatageTraitement; }
}
