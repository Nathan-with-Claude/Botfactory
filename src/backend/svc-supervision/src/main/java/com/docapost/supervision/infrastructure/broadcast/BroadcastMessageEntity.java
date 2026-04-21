package com.docapost.supervision.infrastructure.broadcast;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * BroadcastMessageEntity — Entité JPA BC-03 / US-067
 *
 * Mappe l'aggregate root BroadcastMessage sur la table broadcast_message.
 * Les collections livreurIds et secteursCibles sont stockées dans des tables de jointure.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Entity
@Table(name = "broadcast_message")
public class BroadcastMessageEntity {

    @Id
    @Column(name = "id", nullable = false)
    private String id;

    /** Valeur sérialisée de TypeBroadcast (ALERTE, INFO, CONSIGNE) */
    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "texte", nullable = false, length = 280)
    private String texte;

    /** Valeur sérialisée de TypeCiblage (TOUS, SECTEUR) */
    @Column(name = "type_ciblage", nullable = false)
    private String typeCiblage;

    /** Codes secteurs cibles (vide si ciblage TOUS) */
    @ElementCollection
    @CollectionTable(
            name = "broadcast_message_secteurs",
            joinColumns = @JoinColumn(name = "broadcast_message_id"))
    @Column(name = "code_secteur")
    private List<String> secteursCibles = new ArrayList<>();

    /** Identifiants des livreurs destinataires */
    @ElementCollection
    @CollectionTable(
            name = "broadcast_message_livreurs",
            joinColumns = @JoinColumn(name = "broadcast_message_id"))
    @Column(name = "livreur_id")
    private List<String> livreurIds = new ArrayList<>();

    @Column(name = "superviseur_id", nullable = false)
    private String superviseurId;

    @Column(name = "horodatage_envoi", nullable = false)
    private Instant horodatageEnvoi;

    /** Constructeur JPA */
    protected BroadcastMessageEntity() {}

    public BroadcastMessageEntity(
            String id,
            String type,
            String texte,
            String typeCiblage,
            List<String> secteursCibles,
            List<String> livreurIds,
            String superviseurId,
            Instant horodatageEnvoi) {
        this.id = id;
        this.type = type;
        this.texte = texte;
        this.typeCiblage = typeCiblage;
        this.secteursCibles = new ArrayList<>(secteursCibles);
        this.livreurIds = new ArrayList<>(livreurIds);
        this.superviseurId = superviseurId;
        this.horodatageEnvoi = horodatageEnvoi;
    }

    public String getId() { return id; }
    public String getType() { return type; }
    public String getTexte() { return texte; }
    public String getTypeCiblage() { return typeCiblage; }
    public List<String> getSecteursCibles() { return secteursCibles; }
    public List<String> getLivreurIds() { return livreurIds; }
    public String getSuperviseurId() { return superviseurId; }
    public Instant getHorodatageEnvoi() { return horodatageEnvoi; }
}
