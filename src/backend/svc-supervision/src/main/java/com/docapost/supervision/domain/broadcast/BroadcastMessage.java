package com.docapost.supervision.domain.broadcast;

import com.docapost.supervision.domain.broadcast.events.BroadcastEnvoye;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * BroadcastMessage — Aggregate Root BC-03 / US-067
 *
 * Représente un message broadcast envoyé par un superviseur à ses livreurs actifs.
 * Invariants :
 * - texte non vide
 * - texte ≤ 280 caractères
 * - livreurIds non vide (au moins un destinataire)
 *
 * Toute création passe par la méthode factory statique {@code envoyer(...)}.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public class BroadcastMessage {

    private final String id;
    private final TypeBroadcast type;
    private final String texte;
    private final BroadcastCiblage ciblage;
    private final List<String> livreurIds;
    private final String superviseurId;
    private final Instant horodatageEnvoi;

    private final List<BroadcastEnvoye> evenements = new ArrayList<>();

    private BroadcastMessage(
            String id,
            TypeBroadcast type,
            String texte,
            BroadcastCiblage ciblage,
            List<String> livreurIds,
            String superviseurId,
            Instant horodatageEnvoi) {
        this.id = id;
        this.type = type;
        this.texte = texte;
        this.ciblage = ciblage;
        this.livreurIds = List.copyOf(livreurIds);
        this.superviseurId = superviseurId;
        this.horodatageEnvoi = horodatageEnvoi;
    }

    /**
     * Méthode factory — crée un BroadcastMessage valide et collecte l'événement domaine.
     *
     * @param id           identifiant unique (UUID)
     * @param type         nature du message (ALERTE, INFO, CONSIGNE)
     * @param texte        contenu du message (non vide, ≤ 280 chars)
     * @param ciblage      stratégie de ciblage (TOUS ou SECTEUR)
     * @param superviseurId identifiant du superviseur émetteur
     * @param livreurIds   liste des livreurs destinataires (non vide)
     * @return un BroadcastMessage avec l'événement BroadcastEnvoye collecté
     */
    public static BroadcastMessage envoyer(
            String id,
            TypeBroadcast type,
            String texte,
            BroadcastCiblage ciblage,
            String superviseurId,
            List<String> livreurIds) {

        Objects.requireNonNull(id, "L'identifiant du broadcast ne peut pas être null");
        Objects.requireNonNull(type, "Le type de broadcast ne peut pas être null");
        Objects.requireNonNull(ciblage, "Le ciblage ne peut pas être null");
        Objects.requireNonNull(superviseurId, "L'identifiant du superviseur ne peut pas être null");
        Objects.requireNonNull(livreurIds, "La liste des livreurs ne peut pas être null");

        if (texte == null || texte.isBlank()) {
            throw new IllegalArgumentException("Le texte du broadcast ne peut pas être vide");
        }
        if (texte.length() > 280) {
            throw new IllegalArgumentException(
                    "Le texte du broadcast ne peut pas dépasser 280 caractères (longueur actuelle : " + texte.length() + ")");
        }
        if (livreurIds.isEmpty()) {
            throw new IllegalArgumentException("La liste des livreurs destinataires ne peut pas être vide");
        }

        Instant horodatage = Instant.now();
        BroadcastMessage message = new BroadcastMessage(id, type, texte, ciblage, livreurIds, superviseurId, horodatage);

        message.evenements.add(new BroadcastEnvoye(
                id, type, texte, List.copyOf(livreurIds), superviseurId, horodatage
        ));

        return message;
    }

    /** Retourne les événements domaine collectés (à publier par l'Application Service). */
    public List<BroadcastEnvoye> getEvenements() {
        return List.copyOf(evenements);
    }

    /** Vide la liste interne d'événements après publication. */
    public void clearEvenements() {
        evenements.clear();
    }

    public String getId() {
        return id;
    }

    public TypeBroadcast getType() {
        return type;
    }

    public String getTexte() {
        return texte;
    }

    public BroadcastCiblage getCiblage() {
        return ciblage;
    }

    public List<String> getLivreurIds() {
        return livreurIds;
    }

    public String getSuperviseurId() {
        return superviseurId;
    }

    public Instant getHorodatageEnvoi() {
        return horodatageEnvoi;
    }
}
