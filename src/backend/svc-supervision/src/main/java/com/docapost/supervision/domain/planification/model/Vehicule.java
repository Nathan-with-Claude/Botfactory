package com.docapost.supervision.domain.planification.model;

import java.util.Objects;

/**
 * Vehicule — Entity BC-07 Planification
 *
 * Représente un véhicule affectable à une tournée.
 * Porte la capacité maximale de charge en kilogrammes.
 *
 * Invariants :
 * - vehiculeId est obligatoire et non vide
 * - immatriculation est obligatoire et non vide
 * - capaciteKg doit être strictement positif
 * - typeVehicule est obligatoire
 *
 * Source : US-030
 */
public class Vehicule {

    private final VehiculeId vehiculeId;
    private final String immatriculation;
    private final int capaciteKg;
    private final TypeVehicule typeVehicule;

    public Vehicule(VehiculeId vehiculeId, String immatriculation, int capaciteKg, TypeVehicule typeVehicule) {
        this.vehiculeId = Objects.requireNonNull(vehiculeId, "Le vehiculeId est obligatoire");
        Objects.requireNonNull(immatriculation, "L'immatriculation est obligatoire");
        if (immatriculation.isBlank()) throw new IllegalArgumentException("L'immatriculation ne peut pas être vide");
        this.immatriculation = immatriculation;
        if (capaciteKg <= 0) throw new IllegalArgumentException("La capacité en kg doit être strictement positive");
        this.capaciteKg = capaciteKg;
        this.typeVehicule = Objects.requireNonNull(typeVehicule, "Le typeVehicule est obligatoire");
    }

    /**
     * Indique si ce véhicule peut porter le poids estimé donné.
     *
     * @param poidsEstimeKg poids estimé de la charge (en kg)
     * @return true si poidsEstimeKg <= capaciteKg
     */
    public boolean peutPorter(int poidsEstimeKg) {
        return poidsEstimeKg <= this.capaciteKg;
    }

    /**
     * Calcule la marge de capacité disponible (capacité - poids estimé).
     * Résultat positif ou nul si compatible, négatif si dépassement.
     *
     * @param poidsEstimeKg poids estimé de la charge (en kg)
     * @return marge en kg (peut être négative en cas de dépassement)
     */
    public int calculerMarge(int poidsEstimeKg) {
        return this.capaciteKg - poidsEstimeKg;
    }

    // ─── Getters ──────────────────────────────────────────────────────────────

    public VehiculeId getVehiculeId() { return vehiculeId; }
    public String getImmatriculation() { return immatriculation; }
    public int getCapaciteKg() { return capaciteKg; }
    public TypeVehicule getTypeVehicule() { return typeVehicule; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Vehicule that)) return false;
        return Objects.equals(vehiculeId, that.vehiculeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(vehiculeId);
    }

    @Override
    public String toString() {
        return "Vehicule{id=" + vehiculeId + ", immatriculation=" + immatriculation
                + ", capaciteKg=" + capaciteKg + ", type=" + typeVehicule + '}';
    }
}
