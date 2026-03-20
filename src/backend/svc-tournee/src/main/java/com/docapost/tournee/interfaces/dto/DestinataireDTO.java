package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.model.Destinataire;

/**
 * DTO — Representation d'un Destinataire a la frontiere de la couche Interface.
 * Le telephoneChiffre est transmis tel quel : le masquage UI est a la charge du frontend.
 */
public record DestinataireDTO(
        String nom,
        String telephoneChiffre
) {
    public static DestinataireDTO from(Destinataire destinataire) {
        return new DestinataireDTO(
                destinataire.nom(),
                destinataire.telephoneChiffre()
        );
    }
}
