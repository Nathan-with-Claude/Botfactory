package com.docapost.supervision.infrastructure.broadcast;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * BroadcastSecteurEntity — Entité JPA BC-03 / US-067
 *
 * Mappe le Value Object BroadcastSecteur sur la table broadcast_secteur.
 * livreurIds stockés dans la table d'association broadcast_secteur_livreur.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Entity
@Table(name = "broadcast_secteur")
public class BroadcastSecteurEntity {

    @Id
    @Column(name = "code_secteur", nullable = false)
    private String codeSecteur;

    @Column(name = "libelle", nullable = false)
    private String libelle;

    @Column(name = "actif", nullable = false)
    private boolean actif;

    @ElementCollection
    @CollectionTable(name = "broadcast_secteur_livreur",
            joinColumns = @JoinColumn(name = "code_secteur"))
    @Column(name = "livreur_id")
    private List<String> livreurIds = new ArrayList<>();

    protected BroadcastSecteurEntity() {}

    public BroadcastSecteurEntity(String codeSecteur, String libelle, boolean actif) {
        this.codeSecteur = codeSecteur;
        this.libelle = libelle;
        this.actif = actif;
    }

    public String getCodeSecteur() { return codeSecteur; }
    public String getLibelle() { return libelle; }
    public boolean isActif() { return actif; }
    public List<String> getLivreurIds() { return livreurIds; }
    public void setLivreurIds(List<String> ids) { this.livreurIds = ids; }
}
