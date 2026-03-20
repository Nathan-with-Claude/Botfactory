package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.model.Colis;
import com.docapost.tournee.domain.model.StatutColis;

import java.util.List;

/**
 * DTO — Representation d'un Colis a la frontiere de la couche Interface.
 * Traduit depuis l'entite Colis du domaine.
 *
 * Destine a la reponse GET /api/tournees/today (US-001).
 */
public record ColisDTO(
        String colisId,
        StatutColis statut,
        AdresseDTO adresseLivraison,
        DestinataireDTO destinataire,
        List<ContrainteDTO> contraintes,
        boolean aUneContrainteHoraire
) {
    public static ColisDTO from(Colis colis) {
        return new ColisDTO(
                colis.getId().value(),
                colis.getStatut(),
                AdresseDTO.from(colis.getAdresseLivraison()),
                DestinataireDTO.from(colis.getDestinataire()),
                colis.getContraintes().stream()
                        .map(ContrainteDTO::from)
                        .toList(),
                colis.aUneContrainteHoraire()
        );
    }
}
