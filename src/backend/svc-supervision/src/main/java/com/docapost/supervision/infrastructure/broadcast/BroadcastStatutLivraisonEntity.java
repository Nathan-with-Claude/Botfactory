package com.docapost.supervision.infrastructure.broadcast;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * BroadcastStatutLivraisonEntity — Read Model JPA BC-03 / US-069
 *
 * Projection de la lecture d'un BroadcastMessage par un livreur.
 * Alimentée par les Domain Events BroadcastEnvoye (initialisation statut ENVOYE)
 * et BroadcastVuEvent (transition vers VU avec horodatage).
 *
 * Source authoritative pour les compteurs "Vu par N / M livreurs" affichés dans W-09.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
@Entity
@Table(name = "broadcast_statut_livraison")
public class BroadcastStatutLivraisonEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "broadcast_message_id", nullable = false)
    private String broadcastMessageId;

    @Column(name = "livreur_id", nullable = false)
    private String livreurId;

    @Column(name = "nom_complet_livreur")
    private String nomCompletLivreur;

    /** "ENVOYE" ou "VU" */
    @Column(name = "statut", nullable = false)
    private String statut;

    /** Nullable — renseigné uniquement quand statut == "VU" */
    @Column(name = "horodatage_vu")
    private Instant horodatageVu;

    public BroadcastStatutLivraisonEntity() {}

    public Long getId() { return id; }

    public String getBroadcastMessageId() { return broadcastMessageId; }
    public void setBroadcastMessageId(String broadcastMessageId) {
        this.broadcastMessageId = broadcastMessageId;
    }

    public String getLivreurId() { return livreurId; }
    public void setLivreurId(String livreurId) { this.livreurId = livreurId; }

    public String getNomCompletLivreur() { return nomCompletLivreur; }
    public void setNomCompletLivreur(String nomCompletLivreur) {
        this.nomCompletLivreur = nomCompletLivreur;
    }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Instant getHorodatageVu() { return horodatageVu; }
    public void setHorodatageVu(Instant horodatageVu) { this.horodatageVu = horodatageVu; }
}
