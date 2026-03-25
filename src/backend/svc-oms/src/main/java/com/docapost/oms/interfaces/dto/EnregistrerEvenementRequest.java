package com.docapost.oms.interfaces.dto;

import com.docapost.oms.domain.model.TypeEvenement;

import java.time.Instant;

/**
 * DTO d'entrée — requête d'enregistrement d'un événement de livraison (POST /api/oms/evenements).
 */
public record EnregistrerEvenementRequest(
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
