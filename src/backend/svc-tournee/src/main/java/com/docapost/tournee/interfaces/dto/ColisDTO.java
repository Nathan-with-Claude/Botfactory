package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.model.Colis;
import com.docapost.tournee.domain.model.Disposition;
import com.docapost.tournee.domain.model.MotifNonLivraison;
import com.docapost.tournee.domain.model.StatutColis;

import java.util.List;

/**
 * DTO — Representation d'un Colis a la frontiere de la couche Interface.
 * Traduit depuis l'entite Colis du domaine.
 *
 * Destine a :
 * - GET /api/tournees/today (US-001) : liste des colis de la tournee
 * - GET /api/tournees/{tourneeId}/colis/{colisId} (US-004) : detail d'un colis
 * - POST /api/tournees/{tourneeId}/colis/{colisId}/echec (US-005) : reponse apres declaration echec
 *
 * Le champ estTraite indique si le colis a un statut terminal (US-004).
 * Le masquage du telephoneChiffre est a la charge du frontend (RGPD).
 * motifNonLivraison et disposition : non-nuls uniquement si statut = ECHEC (US-005).
 */
public record ColisDTO(
        String colisId,
        StatutColis statut,
        AdresseDTO adresseLivraison,
        DestinataireDTO destinataire,
        List<ContrainteDTO> contraintes,
        boolean aUneContrainteHoraire,
        boolean estTraite,
        MotifNonLivraison motifNonLivraison,
        Disposition disposition
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
                colis.aUneContrainteHoraire(),
                colis.estTraite(),
                colis.getMotifNonLivraison(),
                colis.getDisposition()
        );
    }
}
