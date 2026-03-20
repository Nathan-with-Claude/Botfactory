package com.docapost.tournee.infrastructure.persistence;

import com.docapost.tournee.domain.model.StatutColis;
import com.docapost.tournee.domain.model.TypeContrainte;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity — Projection persistee de l'entite Colis.
 * Separee de l'entite domain Colis (couche infrastructure).
 *
 * Les contraintes sont stockees en table separee (ColisContrainteEntity)
 * pour normalisation et requetabilite.
 */
@Entity
@Table(name = "colis")
public class ColisEntity {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournee_id", nullable = false)
    private TourneeEntity tournee;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutColis statut;

    // Adresse (Value Object aplati en colonnes)
    @Column(name = "adresse_rue", nullable = false)
    private String adresseRue;

    @Column(name = "adresse_complement")
    private String adresseComplement;

    @Column(name = "adresse_code_postal", nullable = false, length = 10)
    private String adresseCodePostal;

    @Column(name = "adresse_ville", nullable = false, length = 100)
    private String adresseVille;

    @Column(name = "adresse_zone_geographique", length = 50)
    private String adresseZoneGeographique;

    // Destinataire (Value Object aplati en colonnes)
    @Column(name = "destinataire_nom", nullable = false, length = 200)
    private String destinataireNom;

    @Column(name = "destinataire_telephone", length = 20)
    private String destinataireTelephone;

    @ElementCollection
    @CollectionTable(name = "colis_contraintes", joinColumns = @JoinColumn(name = "colis_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "type", column = @Column(name = "type", length = 30)),
            @AttributeOverride(name = "valeur", column = @Column(name = "valeur", length = 200))
    })
    private List<ColisContrainteEmbeddable> contraintes = new ArrayList<>();

    protected ColisEntity() {}

    public ColisEntity(
            String id,
            TourneeEntity tournee,
            StatutColis statut,
            String adresseRue,
            String adresseComplement,
            String adresseCodePostal,
            String adresseVille,
            String adresseZoneGeographique,
            String destinataireNom,
            String destinataireTelephone
    ) {
        this.id = id;
        this.tournee = tournee;
        this.statut = statut;
        this.adresseRue = adresseRue;
        this.adresseComplement = adresseComplement;
        this.adresseCodePostal = adresseCodePostal;
        this.adresseVille = adresseVille;
        this.adresseZoneGeographique = adresseZoneGeographique;
        this.destinataireNom = destinataireNom;
        this.destinataireTelephone = destinataireTelephone;
    }

    // ─── Getters / Setters ────────────────────────────────────────────────────

    public String getId() { return id; }
    public TourneeEntity getTournee() { return tournee; }
    public StatutColis getStatut() { return statut; }
    public void setStatut(StatutColis statut) { this.statut = statut; }
    public String getAdresseRue() { return adresseRue; }
    public String getAdresseComplement() { return adresseComplement; }
    public String getAdresseCodePostal() { return adresseCodePostal; }
    public String getAdresseVille() { return adresseVille; }
    public String getAdresseZoneGeographique() { return adresseZoneGeographique; }
    public String getDestinataireNom() { return destinataireNom; }
    public String getDestinataireTeéléphone() { return destinataireTelephone; }
    public List<ColisContrainteEmbeddable> getContraintes() { return contraintes; }
    public void setContraintes(List<ColisContrainteEmbeddable> contraintes) { this.contraintes = contraintes; }
}
