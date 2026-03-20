package com.docapost.tournee.infrastructure.persistence;

import com.docapost.tournee.domain.model.TypeContrainte;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

/**
 * Embeddable JPA — Contrainte d'un Colis stockee en table elementCollection.
 * Correspond au Value Object Contrainte du domaine.
 */
@Embeddable
public class ColisContrainteEmbeddable {

    @Enumerated(EnumType.STRING)
    private TypeContrainte type;

    private String valeur;

    protected ColisContrainteEmbeddable() {}

    public ColisContrainteEmbeddable(TypeContrainte type, String valeur) {
        this.type = type;
        this.valeur = valeur;
    }

    public TypeContrainte getType() { return type; }
    public String getValeur() { return valeur; }
}
