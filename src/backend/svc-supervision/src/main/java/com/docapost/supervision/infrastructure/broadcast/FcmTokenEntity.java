package com.docapost.supervision.infrastructure.broadcast;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * FcmTokenEntity — Entité JPA BC-03 / US-067
 *
 * Stocke le token FCM d'un livreur pour l'envoi de notifications push.
 * Un livreur a au plus un token actif (son dernier enregistrement mobile).
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Entity
@Table(name = "fcm_token")
public class FcmTokenEntity {

    @Id
    @Column(name = "livreur_id", nullable = false)
    private String livreurId;

    @Column(name = "token", nullable = false)
    private String token;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Constructeur JPA */
    protected FcmTokenEntity() {}

    public FcmTokenEntity(String livreurId, String token, Instant updatedAt) {
        this.livreurId = livreurId;
        this.token = token;
        this.updatedAt = updatedAt;
    }

    public String getLivreurId() { return livreurId; }
    public String getToken() { return token; }
    public Instant getUpdatedAt() { return updatedAt; }
}
