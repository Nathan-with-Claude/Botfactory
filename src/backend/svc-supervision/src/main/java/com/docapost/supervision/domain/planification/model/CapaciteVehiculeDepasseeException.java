package com.docapost.supervision.domain.planification.model;

/**
 * CapaciteVehiculeDepasseeException — Exception métier BC-07 Planification
 *
 * Levée quand le poids estimé de la tournée dépasse la capacité du véhicule sélectionné.
 * Le logisticien peut contourner cette exception via "Affecter quand même"
 * (qui déclenche forcerAffectationMalgreDepassement).
 *
 * Source : US-030
 */
public class CapaciteVehiculeDepasseeException extends RuntimeException {

    private final String vehiculeId;
    private final int capaciteKg;
    private final int poidsEstimeKg;
    private final int depassementKg;

    public CapaciteVehiculeDepasseeException(String vehiculeId, int capaciteKg, int poidsEstimeKg) {
        super(String.format(
                "%s : capacité %d kg, tournée estimée %d kg — risque de surcharge (dépassement : %d kg).",
                vehiculeId, capaciteKg, poidsEstimeKg, poidsEstimeKg - capaciteKg
        ));
        this.vehiculeId = vehiculeId;
        this.capaciteKg = capaciteKg;
        this.poidsEstimeKg = poidsEstimeKg;
        this.depassementKg = poidsEstimeKg - capaciteKg;
    }

    public String getVehiculeId() { return vehiculeId; }
    public int getCapaciteKg() { return capaciteKg; }
    public int getPoidsEstimeKg() { return poidsEstimeKg; }
    public int getDepassementKg() { return depassementKg; }
}
