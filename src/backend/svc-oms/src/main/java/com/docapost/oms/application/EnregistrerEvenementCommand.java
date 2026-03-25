package com.docapost.oms.application;

import com.docapost.oms.domain.model.TypeEvenement;

import java.time.Instant;

/**
 * Commande d'enregistrement d'un événement de livraison dans l'Event Store (US-018).
 *
 * Tous les champs obligatoires correspondent aux 4 attributs immuables :
 * - qui : livreurId
 * - quoi : type + colisId
 * - quand : horodatage
 * - géolocalisation : latitude + longitude (null si mode dégradé GPS)
 */
public record EnregistrerEvenementCommand(
        String eventId,
        String tourneeId,
        String colisId,
        String livreurId,
        TypeEvenement type,
        Instant horodatage,
        Double latitude,
        Double longitude,
        String preuveLivraisonId,
        String motifEchec
) {}
