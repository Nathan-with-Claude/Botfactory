package com.docapost.oms.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Value Object immuable — représente un événement de livraison dans l'Event Store (US-018).
 *
 * Invariants :
 * - Quatre attributs obligatoires : qui (livreurId), quoi (type + colisId), quand (horodatage),
 *   géolocalisation (coordonnees — null si mode dégradé GPS, documenté via modeDegradGPS).
 * - Aucun attribut ne peut être modifié après création.
 * - Un eventId unique identifie chaque événement (idempotence OMS, US-017 Scénario 3).
 *
 * Pattern : Value Object (DDD Evans) — identité par valeur (eventId).
 */
public record EvenementLivraison(
        String eventId,
        String tourneeId,
        String colisId,
        String livreurId,
        TypeEvenement type,
        Instant horodatage,
        Coordonnees coordonnees,
        boolean modeDegradGPS,
        String preuveLivraisonId,
        String motifEchec,
        StatutSynchronisation statutSynchronisation,
        int tentativesSynchronisation
) {

    public EvenementLivraison {
        Objects.requireNonNull(eventId, "eventId est obligatoire");
        Objects.requireNonNull(tourneeId, "tourneeId est obligatoire");
        Objects.requireNonNull(livreurId, "livreurId est obligatoire (qui)");
        Objects.requireNonNull(type, "type est obligatoire (quoi)");
        Objects.requireNonNull(horodatage, "horodatage est obligatoire (quand)");
        Objects.requireNonNull(statutSynchronisation, "statutSynchronisation est obligatoire");
        if (coordonnees == null && !modeDegradGPS) {
            throw new IllegalArgumentException(
                    "coordonnees null : modeDegradGPS doit être true pour documenter l'absence de GPS"
            );
        }
        if (tentativesSynchronisation < 0) {
            throw new IllegalArgumentException("tentativesSynchronisation ne peut pas être négatif");
        }
    }

    /**
     * Retourne un nouvel EvenementLivraison avec le statut SYNCHRONIZED.
     * L'immuabilité est préservée — aucun champ existant n'est modifié.
     */
    public EvenementLivraison marquerSynchronise() {
        return new EvenementLivraison(
                eventId, tourneeId, colisId, livreurId, type, horodatage,
                coordonnees, modeDegradGPS, preuveLivraisonId, motifEchec,
                StatutSynchronisation.SYNCHRONIZED, tentativesSynchronisation + 1
        );
    }

    /**
     * Retourne un nouvel EvenementLivraison avec le statut FAILED et le compteur incrémenté.
     */
    public EvenementLivraison marquerEchecSynchronisation() {
        return new EvenementLivraison(
                eventId, tourneeId, colisId, livreurId, type, horodatage,
                coordonnees, modeDegradGPS, preuveLivraisonId, motifEchec,
                StatutSynchronisation.FAILED, tentativesSynchronisation + 1
        );
    }
}
