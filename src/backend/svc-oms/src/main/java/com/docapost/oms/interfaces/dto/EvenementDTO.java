package com.docapost.oms.interfaces.dto;

import com.docapost.oms.domain.model.EvenementLivraison;

import java.time.Instant;

/**
 * DTO de sortie — représentation d'un événement de livraison pour l'API REST.
 * Les objets de domaine ne sortent pas de la couche Application/Domain.
 */
public record EvenementDTO(
        String eventId,
        String tourneeId,
        String colisId,
        String livreurId,
        String type,
        Instant horodatage,
        Double latitude,
        Double longitude,
        boolean modeDegradGPS,
        String preuveLivraisonId,
        String motifEchec,
        String statutSynchronisation,
        int tentativesSynchronisation
) {
    public static EvenementDTO from(EvenementLivraison ev) {
        return new EvenementDTO(
                ev.eventId(),
                ev.tourneeId(),
                ev.colisId(),
                ev.livreurId(),
                ev.type().name(),
                ev.horodatage(),
                ev.coordonnees() != null ? ev.coordonnees().latitude() : null,
                ev.coordonnees() != null ? ev.coordonnees().longitude() : null,
                ev.modeDegradGPS(),
                ev.preuveLivraisonId(),
                ev.motifEchec(),
                ev.statutSynchronisation().name(),
                ev.tentativesSynchronisation()
        );
    }
}
