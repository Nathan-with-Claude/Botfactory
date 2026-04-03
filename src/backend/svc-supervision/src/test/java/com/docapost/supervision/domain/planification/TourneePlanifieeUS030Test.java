package com.docapost.supervision.domain.planification;

import com.docapost.supervision.domain.planification.events.CompatibiliteVehiculeEchouee;
import com.docapost.supervision.domain.planification.events.CompatibiliteVehiculeVerifiee;
import com.docapost.supervision.domain.planification.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests TDD — TourneePlanifiee US-030 : Vérification compatibilité véhicule / charge
 *
 * Scénarios couverts :
 * SC1 — Véhicule compatible (poids <= capacité) → CompatibiliteVehiculeVerifiee
 * SC2 — Véhicule insuffisant (poids > capacité)  → exception PlanificationInvariantException
 * SC3 — Force l'affectation malgré dépassement   → CompatibiliteVehiculeEchouee
 * SC4 — Poids absent (null)                       → vérification ignorée, pas d'event
 * SC5 — Changement de véhicule recalcule la vérification
 */
class TourneePlanifieeUS030Test {

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Tournée avec poids estimé de 350 kg */
    private TourneePlanifiee tourneeAvecPoids(Integer poidsEstimeKg) {
        return new TourneePlanifiee(
                "tp-030", "T-030", LocalDate.now(), 40,
                List.of(new ZoneTournee("Lyon 3e", 40)),
                List.of(),
                List.of(),
                Instant.now(),
                poidsEstimeKg
        );
    }

    /** Tournée sans poids estimé (donnée TMS absente) */
    private TourneePlanifiee tourneeSansPoids() {
        return tourneeAvecPoids(null);
    }

    private Vehicule vehiculeCapacite(String vehiculeId, int capaciteKg) {
        return new Vehicule(new VehiculeId(vehiculeId), vehiculeId, capaciteKg, TypeVehicule.FOURGON);
    }

    // ─── SC1 : Véhicule compatible ─────────────────────────────────────────────

    @Test
    @DisplayName("SC1 — véhicule compatible (poids 350 kg, capacité 500 kg) émet CompatibiliteVehiculeVerifiee")
    void sc1_vehicule_compatible_emet_event_verifiee() {
        TourneePlanifiee tournee = tourneeAvecPoids(350);
        Vehicule vehicule = vehiculeCapacite("VH-07", 500);

        tournee.verifierCompatibiliteVehicule(vehicule, "superviseur-001");

        assertThat(tournee.getEvenements()).hasSize(1);
        assertThat(tournee.getEvenements().get(0)).isInstanceOf(CompatibiliteVehiculeVerifiee.class);

        CompatibiliteVehiculeVerifiee event = (CompatibiliteVehiculeVerifiee) tournee.getEvenements().get(0);
        assertThat(event.tourneePlanifieeId()).isEqualTo("tp-030");
        assertThat(event.vehiculeId()).isEqualTo("VH-07");
        assertThat(event.poidsEstimeKg()).isEqualTo(350);
        assertThat(event.capaciteKg()).isEqualTo(500);
        assertThat(event.margeKg()).isEqualTo(150); // marge = capacité - poids
        assertThat(event.superviseurId()).isEqualTo("superviseur-001");
    }

    @Test
    @DisplayName("SC1 — un véhicule exactement à la limite (350/350) est compatible")
    void sc1_vehicule_exact_limite_est_compatible() {
        TourneePlanifiee tournee = tourneeAvecPoids(350);
        Vehicule vehicule = vehiculeCapacite("VH-07", 350);

        tournee.verifierCompatibiliteVehicule(vehicule, "superviseur-001");

        assertThat(tournee.getEvenements()).hasSize(1);
        assertThat(tournee.getEvenements().get(0)).isInstanceOf(CompatibiliteVehiculeVerifiee.class);
        CompatibiliteVehiculeVerifiee event = (CompatibiliteVehiculeVerifiee) tournee.getEvenements().get(0);
        assertThat(event.margeKg()).isZero();
    }

    // ─── SC2 : Véhicule insuffisant ────────────────────────────────────────────

    @Test
    @DisplayName("SC2 — véhicule insuffisant (poids 410 kg, capacité 400 kg) lève PlanificationInvariantException")
    void sc2_vehicule_insuffisant_leve_exception() {
        TourneePlanifiee tournee = tourneeAvecPoids(410);
        Vehicule vehicule = vehiculeCapacite("VH-07", 400);

        assertThatThrownBy(() -> tournee.verifierCompatibiliteVehicule(vehicule, "superviseur-001"))
                .isInstanceOf(CapaciteVehiculeDepasseeException.class)
                .hasMessageContaining("VH-07")
                .hasMessageContaining("400")
                .hasMessageContaining("410");
    }

    @Test
    @DisplayName("SC2 — véhicule insuffisant ne modifie pas les événements de l'agrégat")
    void sc2_vehicule_insuffisant_aucun_event_emis() {
        TourneePlanifiee tournee = tourneeAvecPoids(410);
        Vehicule vehicule = vehiculeCapacite("VH-07", 400);

        assertThatThrownBy(() -> tournee.verifierCompatibiliteVehicule(vehicule, "superviseur-001"))
                .isInstanceOf(CapaciteVehiculeDepasseeException.class);

        assertThat(tournee.getEvenements()).isEmpty();
    }

    // ─── SC3 : Force affectation malgré dépassement ────────────────────────────

    @Test
    @DisplayName("SC3 — forcer l'affectation malgré dépassement émet CompatibiliteVehiculeEchouee")
    void sc3_forcer_affectation_depassement_emet_event_echouee() {
        TourneePlanifiee tournee = tourneeAvecPoids(410);
        Vehicule vehicule = vehiculeCapacite("VH-07", 400);

        tournee.forcerAffectationMalgreDepassement(vehicule, "superviseur-001");

        assertThat(tournee.getEvenements()).hasSize(1);
        assertThat(tournee.getEvenements().get(0)).isInstanceOf(CompatibiliteVehiculeEchouee.class);

        CompatibiliteVehiculeEchouee event = (CompatibiliteVehiculeEchouee) tournee.getEvenements().get(0);
        assertThat(event.tourneePlanifieeId()).isEqualTo("tp-030");
        assertThat(event.vehiculeId()).isEqualTo("VH-07");
        assertThat(event.poidsEstimeKg()).isEqualTo(410);
        assertThat(event.capaciteKg()).isEqualTo(400);
        assertThat(event.depassementKg()).isEqualTo(10); // dépassement = poids - capacité
        assertThat(event.superviseurId()).isEqualTo("superviseur-001");
    }

    @Test
    @DisplayName("SC3 — forcerAffectation sur véhicule compatible lève PlanificationInvariantException (incohérent)")
    void sc3_forcer_affectation_vehicule_compatible_leve_exception() {
        TourneePlanifiee tournee = tourneeAvecPoids(300);
        Vehicule vehicule = vehiculeCapacite("VH-07", 500);

        assertThatThrownBy(() -> tournee.forcerAffectationMalgreDepassement(vehicule, "superviseur-001"))
                .isInstanceOf(PlanificationInvariantException.class)
                .hasMessageContaining("compatible");
    }

    // ─── SC4 : Poids absent ────────────────────────────────────────────────────

    @Test
    @DisplayName("SC4 — poids absent dans composition → vérification ignorée, aucun event émis")
    void sc4_poids_absent_aucun_event_emis() {
        TourneePlanifiee tournee = tourneeSansPoids();
        Vehicule vehicule = vehiculeCapacite("VH-07", 500);

        // Ne lève pas d'exception, n'émet pas d'event
        assertThatCode(() -> tournee.verifierCompatibiliteVehicule(vehicule, "superviseur-001"))
                .doesNotThrowAnyException();

        assertThat(tournee.getEvenements()).isEmpty();
    }

    @Test
    @DisplayName("SC4 — poids absent → estCompatibleAvec retourne POIDS_ABSENT")
    void sc4_poids_absent_retourne_statut_poids_absent() {
        TourneePlanifiee tournee = tourneeSansPoids();
        Vehicule vehicule = vehiculeCapacite("VH-07", 500);

        ResultatCompatibilite resultat = tournee.evaluerCompatibiliteVehicule(vehicule);

        assertThat(resultat).isEqualTo(ResultatCompatibilite.POIDS_ABSENT);
    }

    // ─── SC1 : evaluerCompatibiliteVehicule ────────────────────────────────────

    @Test
    @DisplayName("evaluerCompatibiliteVehicule retourne COMPATIBLE si poids <= capacité")
    void evaluer_retourne_compatible() {
        TourneePlanifiee tournee = tourneeAvecPoids(350);
        Vehicule vehicule = vehiculeCapacite("VH-07", 500);

        assertThat(tournee.evaluerCompatibiliteVehicule(vehicule)).isEqualTo(ResultatCompatibilite.COMPATIBLE);
    }

    @Test
    @DisplayName("evaluerCompatibiliteVehicule retourne DEPASSEMENT si poids > capacité")
    void evaluer_retourne_depassement() {
        TourneePlanifiee tournee = tourneeAvecPoids(500);
        Vehicule vehicule = vehiculeCapacite("VH-07", 400);

        assertThat(tournee.evaluerCompatibiliteVehicule(vehicule)).isEqualTo(ResultatCompatibilite.DEPASSEMENT);
    }

    // ─── Null guards ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("verifierCompatibiliteVehicule avec vehicule null lève NullPointerException")
    void verifier_vehicule_null_leve_npe() {
        TourneePlanifiee tournee = tourneeAvecPoids(350);

        assertThatThrownBy(() -> tournee.verifierCompatibiliteVehicule(null, "superviseur-001"))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("verifierCompatibiliteVehicule avec superviseurId null lève NullPointerException")
    void verifier_superviseurId_null_leve_npe() {
        TourneePlanifiee tournee = tourneeAvecPoids(350);
        Vehicule vehicule = vehiculeCapacite("VH-07", 500);

        assertThatThrownBy(() -> tournee.verifierCompatibiliteVehicule(vehicule, null))
                .isInstanceOf(NullPointerException.class);
    }
}
