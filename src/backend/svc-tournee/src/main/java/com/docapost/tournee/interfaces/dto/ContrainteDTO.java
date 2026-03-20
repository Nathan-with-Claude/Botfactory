package com.docapost.tournee.interfaces.dto;

import com.docapost.tournee.domain.model.Contrainte;
import com.docapost.tournee.domain.model.TypeContrainte;

/**
 * DTO — Representation d'une Contrainte a la frontiere de la couche Interface.
 * Les objets domaine ne sortent jamais de la couche Domain/Application.
 */
public record ContrainteDTO(
        TypeContrainte type,
        String valeur,
        boolean estHoraire
) {
    public static ContrainteDTO from(Contrainte contrainte) {
        return new ContrainteDTO(
                contrainte.type(),
                contrainte.valeur(),
                contrainte.estHoraire()
        );
    }
}
