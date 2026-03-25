package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.model.Adresse;

/**
 * DTO — Representation d'une Adresse a la frontiere de la couche Interface.
 */
public record AdresseDTO(
        String rue,
        String complementAdresse,
        String codePostal,
        String ville,
        String zoneGeographique,
        String adresseComplete
) {
    public static AdresseDTO from(Adresse adresse) {
        return new AdresseDTO(
                adresse.rue(),
                adresse.complementAdresse(),
                adresse.codePostal(),
                adresse.ville(),
                adresse.zoneGeographique(),
                adresse.adresseComplete()
        );
    }
}
