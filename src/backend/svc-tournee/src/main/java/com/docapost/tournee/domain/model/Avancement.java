package com.docapost.tournee.domain.model;

import java.time.LocalTime;

/**
 * Value Object calcule — Avancement d'une Tournee.
 * Produit par Tournee.calculerAvancement().
 * Immuable.
 *
 * resteALivrer = colisTotal - colisTraites
 * estimationFin : null si pas encore calculable (donnee non dispo dans MVP — future evolution)
 */
public record Avancement(
        int colisTraites,
        int colisTotal,
        LocalTime estimationFin
) {
    public int resteALivrer() {
        return colisTotal - colisTraites;
    }

    public boolean estTerminee() {
        return colisTraites == colisTotal;
    }
}
