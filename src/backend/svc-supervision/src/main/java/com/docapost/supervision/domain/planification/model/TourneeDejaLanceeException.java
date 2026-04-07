package com.docapost.supervision.domain.planification.model;

/**
 * TourneeDejaLanceeException — Invariant BC-07
 *
 * Levée quand on tente de désaffecter un livreur d'une tournée déjà lancée (US-050).
 * Une tournée en cours d'exécution ne peut pas être désaffectée.
 *
 * Source : US-050
 */
public class TourneeDejaLanceeException extends RuntimeException {

    private final String codeTms;

    public TourneeDejaLanceeException(String codeTms) {
        super("Impossible de désaffecter un livreur d'une tournée en cours (codeTms=" + codeTms
                + "). Clôturez d'abord la tournée depuis l'application mobile.");
        this.codeTms = codeTms;
    }

    public String getCodeTms() { return codeTms; }
}
