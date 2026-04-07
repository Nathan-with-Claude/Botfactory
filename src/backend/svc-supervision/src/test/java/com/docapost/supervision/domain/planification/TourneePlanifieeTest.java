package com.docapost.supervision.domain.planification;

import com.docapost.supervision.domain.planification.events.AffectationEnregistree;
import com.docapost.supervision.domain.planification.events.CompositionVerifiee;
import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.domain.planification.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Tests TDD — TourneePlanifiee Aggregate (BC-07 Planification — US-021 à US-024)
 */
class TourneePlanifieeTest {

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneeSansAnomalie() {
        return new TourneePlanifiee(
                "tp-001", "T-201", LocalDate.now(), 34,
                List.of(new ZoneTournee("Lyon 3e", 20), new ZoneTournee("Lyon 6e", 14)),
                List.of(new ContrainteHoraire("Livraison avant 10h00", 5)),
                List.of(),
                Instant.now()
        );
    }

    private TourneePlanifiee tourneeAvecAnomalie() {
        return new TourneePlanifiee(
                "tp-003", "T-203", LocalDate.now(), 41,
                List.of(new ZoneTournee("Lyon 8e", 27), new ZoneTournee("Lyon 5e", 14)),
                List.of(new ContrainteHoraire("Livraison avant 10h00", 6)),
                List.of(new Anomalie("SURCHARGE", "41 colis dépasse le seuil de 35 pour ce type de tournée")),
                Instant.now()
        );
    }

    // ─── US-021 : Visualiser plan du jour ─────────────────────────────────────

    @Test
    @DisplayName("une nouvelle tournée importée est NON_AFFECTEE")
    void nouvelle_tournee_est_non_affectee() {
        TourneePlanifiee tournee = tourneeSansAnomalie();

        assertThat(tournee.getStatut()).isEqualTo(StatutAffectation.NON_AFFECTEE);
        assertThat(tournee.getLivreurId()).isNull();
        assertThat(tournee.getVehiculeId()).isNull();
        assertThat(tournee.getEvenements()).isEmpty();
    }

    @Test
    @DisplayName("une tournée sans anomalie ne présente pas d'anomalies")
    void tournee_sans_anomalie_a_des_anomalies_est_false() {
        TourneePlanifiee tournee = tourneeSansAnomalie();

        assertThat(tournee.aDesAnomalies()).isFalse();
        assertThat(tournee.getAnomalies()).isEmpty();
    }

    @Test
    @DisplayName("une tournée avec anomalie de surcharge l'expose correctement")
    void tournee_avec_anomalie_surcharge_est_detectable() {
        TourneePlanifiee tournee = tourneeAvecAnomalie();

        assertThat(tournee.aDesAnomalies()).isTrue();
        assertThat(tournee.getAnomalies()).hasSize(1);
        assertThat(tournee.getAnomalies().get(0).getCode()).isEqualTo("SURCHARGE");
    }

    @Test
    @DisplayName("les propriétés de la tournée importée sont correctement exposées")
    void proprietes_tournee_importee_sont_correctes() {
        TourneePlanifiee tournee = tourneeSansAnomalie();

        assertThat(tournee.getCodeTms()).isEqualTo("T-201");
        assertThat(tournee.getNbColis()).isEqualTo(34);
        assertThat(tournee.getZones()).hasSize(2);
        assertThat(tournee.getZones().get(0).getNom()).isEqualTo("Lyon 3e");
        assertThat(tournee.getContraintes()).hasSize(1);
    }

    // ─── US-022 : Vérifier composition ────────────────────────────────────────

    @Test
    @DisplayName("verifierComposition émet CompositionVerifiee et marque la tournée vérifiée")
    void verifier_composition_emet_event_et_marque_tournee_verifiee() {
        TourneePlanifiee tournee = tourneeSansAnomalie();

        tournee.verifierComposition("superviseur-001");

        assertThat(tournee.isCompositionVerifiee()).isTrue();
        assertThat(tournee.getEvenements()).hasSize(1);
        assertThat(tournee.getEvenements().get(0)).isInstanceOf(CompositionVerifiee.class);
        CompositionVerifiee event = (CompositionVerifiee) tournee.getEvenements().get(0);
        assertThat(event.tourneePlanifieeId()).isEqualTo("tp-001");
        assertThat(event.superviseurId()).isEqualTo("superviseur-001");
    }

    @Test
    @DisplayName("verifierComposition peut être appelée même si la tournée a des anomalies (non bloquant)")
    void verifier_composition_avec_anomalie_est_non_bloquant() {
        TourneePlanifiee tournee = tourneeAvecAnomalie();

        assertThatCode(() -> tournee.verifierComposition("superviseur-001")).doesNotThrowAnyException();
        assertThat(tournee.isCompositionVerifiee()).isTrue();
    }

    // ─── US-023 : Affecter livreur et véhicule ────────────────────────────────

    @Test
    @DisplayName("affecter passe le statut à AFFECTEE et émet AffectationEnregistree")
    void affecter_passe_statut_affectee_et_emet_event() {
        TourneePlanifiee tournee = tourneeSansAnomalie();

        tournee.affecter("livreur-001", "Pierre Morel", "VH-07", "superviseur-001");

        assertThat(tournee.getStatut()).isEqualTo(StatutAffectation.AFFECTEE);
        assertThat(tournee.getLivreurId()).isEqualTo("livreur-001");
        assertThat(tournee.getLivreurNom()).isEqualTo("Pierre Morel");
        assertThat(tournee.getVehiculeId()).isEqualTo("VH-07");
        assertThat(tournee.getAffecteeLe()).isNotNull();
        assertThat(tournee.getEvenements()).hasSize(1);
        AffectationEnregistree event = (AffectationEnregistree) tournee.getEvenements().get(0);
        assertThat(event.livreurId()).isEqualTo("livreur-001");
        assertThat(event.vehiculeId()).isEqualTo("VH-07");
        assertThat(event.superviseurId()).isEqualTo("superviseur-001");
    }

    @Test
    @DisplayName("affecter sur une tournée déjà LANCEE lève PlanificationInvariantException")
    void affecter_sur_tournee_lancee_leve_exception() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Morel", "VH-07", "superviseur-001");
        tournee.lancer("superviseur-001");

        assertThatThrownBy(() -> tournee.affecter("livreur-002", "Marie Petit", "VH-08", "superviseur-001"))
                .isInstanceOf(PlanificationInvariantException.class)
                .hasMessageContaining("déjà lancée");
    }

    @Test
    @DisplayName("affecter sans livreurId lève NullPointerException")
    void affecter_sans_livreur_id_leve_npe() {
        TourneePlanifiee tournee = tourneeSansAnomalie();

        assertThatThrownBy(() -> tournee.affecter(null, "Pierre Morel", "VH-07", "superviseur-001"))
                .isInstanceOf(NullPointerException.class);
    }

    @Test
    @DisplayName("une tournée affectée est toujours affectable (peut être réaffectée)")
    void tournee_affectee_est_affectable() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Morel", "VH-07", "superviseur-001");

        assertThat(tournee.estAffectable()).isTrue();
    }

    @Test
    @DisplayName("une tournée lancée n'est plus affectable")
    void tournee_lancee_n_est_plus_affectable() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Morel", "VH-07", "superviseur-001");
        tournee.lancer("superviseur-001");

        assertThat(tournee.estAffectable()).isFalse();
    }

    // ─── US-024 : Lancer tournée ───────────────────────────────────────────────

    @Test
    @DisplayName("lancer une tournée AFFECTEE émet TourneeLancee et passe le statut à LANCEE")
    void lancer_tournee_affectee_emet_event_et_passe_statut_lance() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Morel", "VH-07", "superviseur-001");
        tournee.clearEvenements(); // nettoyer l'event d'affectation pour tester seulement lancer()

        tournee.lancer("superviseur-001");

        assertThat(tournee.getStatut()).isEqualTo(StatutAffectation.LANCEE);
        assertThat(tournee.getLancee()).isNotNull();
        assertThat(tournee.getEvenements()).hasSize(1);
        TourneeLancee event = (TourneeLancee) tournee.getEvenements().get(0);
        assertThat(event.tourneePlanifieeId()).isEqualTo("tp-001");
        assertThat(event.codeTms()).isEqualTo("T-201");
        assertThat(event.livreurId()).isEqualTo("livreur-001");
        assertThat(event.superviseurId()).isEqualTo("superviseur-001");
    }

    @Test
    @DisplayName("lancer une tournée NON_AFFECTEE lève PlanificationInvariantException")
    void lancer_tournee_non_affectee_leve_exception() {
        TourneePlanifiee tournee = tourneeSansAnomalie();

        assertThatThrownBy(() -> tournee.lancer("superviseur-001"))
                .isInstanceOf(PlanificationInvariantException.class)
                .hasMessageContaining("AFFECTEE");
    }

    @Test
    @DisplayName("lancer une tournée déjà LANCEE lève PlanificationInvariantException (idempotence)")
    void lancer_tournee_deja_lancee_leve_exception() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Morel", "VH-07", "superviseur-001");
        tournee.lancer("superviseur-001");

        assertThatThrownBy(() -> tournee.lancer("superviseur-001"))
                .isInstanceOf(PlanificationInvariantException.class)
                .hasMessageContaining("AFFECTEE");
    }

    @Test
    @DisplayName("clearEvenements vide la liste des événements collectés")
    void clear_evenements_vide_la_liste() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.verifierComposition("superviseur-001");
        assertThat(tournee.getEvenements()).hasSize(1);

        tournee.clearEvenements();

        assertThat(tournee.getEvenements()).isEmpty();
    }

    // ─── US-053 : Reconstruction depuis persistance avec poids estimé ────────

    @Test
    @DisplayName("la reconstruction depuis la persistance avec poidsEstimeKg restitue le poids — pas POIDS_ABSENT (US-053)")
    void reconstruction_depuis_persistance_avec_poids_restitue_le_poids() {
        TourneePlanifiee tournee = new TourneePlanifiee(
                "tp-010", "T-210", LocalDate.now(), 20,
                List.of(new ZoneTournee("Lyon 3e", 20)),
                List.of(),
                List.of(),
                Instant.now(),
                StatutAffectation.AFFECTEE,
                "livreur-001", "Pierre Martin", "VH-07",
                Instant.now(), null, true,
                450  // poidsEstimeKg restitué depuis la persistance
        );

        Vehicule vehicule = new Vehicule(
                new VehiculeId("VH-07"), "AB-123-CD", 600, TypeVehicule.FOURGON
        );
        assertThat(tournee.getPoidsEstimeKg()).isEqualTo(450);
        assertThat(tournee.evaluerCompatibiliteVehicule(vehicule))
                .isEqualTo(ResultatCompatibilite.COMPATIBLE);
    }

    @Test
    @DisplayName("la reconstruction depuis persistance sans poids retourne POIDS_ABSENT (comportement attendu)")
    void reconstruction_depuis_persistance_sans_poids_retourne_poids_absent() {
        TourneePlanifiee tournee = new TourneePlanifiee(
                "tp-011", "T-211", LocalDate.now(), 20,
                List.of(new ZoneTournee("Lyon 3e", 20)),
                List.of(),
                List.of(),
                Instant.now(),
                StatutAffectation.AFFECTEE,
                "livreur-001", "Pierre Martin", "VH-07",
                Instant.now(), null, true,
                null  // poids absent — comportement SC4
        );

        Vehicule vehicule = new Vehicule(
                new VehiculeId("VH-07"), "AB-123-CD", 600, TypeVehicule.FOURGON
        );
        assertThat(tournee.getPoidsEstimeKg()).isNull();
        assertThat(tournee.evaluerCompatibiliteVehicule(vehicule))
                .isEqualTo(ResultatCompatibilite.POIDS_ABSENT);
    }

    // ─── US-050 : Désaffecter un livreur ─────────────────────────────────────

    @Test
    @DisplayName("desaffecter une tournée AFFECTEE remet le statut à NON_AFFECTEE et efface le livreur")
    void desaffecter_tournee_affectee_remet_a_non_affectee() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Martin", "VH-07", "superviseur-001");
        tournee.clearEvenements();

        tournee.desaffecter("superviseur-001");

        assertThat(tournee.getStatut()).isEqualTo(StatutAffectation.NON_AFFECTEE);
        assertThat(tournee.getLivreurId()).isNull();
        assertThat(tournee.getLivreurNom()).isNull();
        assertThat(tournee.getVehiculeId()).isNull();
    }

    @Test
    @DisplayName("desaffecter une tournée AFFECTEE émet DesaffectationEnregistree")
    void desaffecter_tournee_affectee_emet_event() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Martin", "VH-07", "superviseur-001");
        tournee.clearEvenements();

        tournee.desaffecter("superviseur-001");

        assertThat(tournee.getEvenements()).hasSize(1);
        assertThat(tournee.getEvenements().get(0)).isInstanceOf(
                com.docapost.supervision.domain.planification.events.DesaffectationEnregistree.class
        );
        var event = (com.docapost.supervision.domain.planification.events.DesaffectationEnregistree)
                tournee.getEvenements().get(0);
        assertThat(event.tourneePlanifieeId()).isEqualTo("tp-001");
        assertThat(event.codeTms()).isEqualTo("T-201");
        assertThat(event.livreurIdRetire()).isEqualTo("livreur-001");
        assertThat(event.superviseurId()).isEqualTo("superviseur-001");
        assertThat(event.desaffecteeLe()).isNotNull();
    }

    @Test
    @DisplayName("desaffecter une tournée LANCEE lève TourneeDejaLanceeException")
    void desaffecter_tournee_lancee_leve_exception() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Martin", "VH-07", "superviseur-001");
        tournee.lancer("superviseur-001");

        assertThatThrownBy(() -> tournee.desaffecter("superviseur-001"))
                .isInstanceOf(TourneeDejaLanceeException.class)
                .hasMessageContaining("cours");
    }

    @Test
    @DisplayName("desaffecter une tournée NON_AFFECTEE lève PlanificationInvariantException")
    void desaffecter_tournee_non_affectee_leve_exception() {
        TourneePlanifiee tournee = tourneeSansAnomalie();

        assertThatThrownBy(() -> tournee.desaffecter("superviseur-001"))
                .isInstanceOf(PlanificationInvariantException.class)
                .hasMessageContaining("AFFECTEE");
    }

    @Test
    @DisplayName("après desaffectation, la tournée est à nouveau affectable")
    void apres_desaffectation_tournee_est_affectable() {
        TourneePlanifiee tournee = tourneeSansAnomalie();
        tournee.affecter("livreur-001", "Pierre Martin", "VH-07", "superviseur-001");
        tournee.desaffecter("superviseur-001");

        assertThat(tournee.estAffectable()).isTrue();
        assertThat(tournee.getStatut()).isEqualTo(StatutAffectation.NON_AFFECTEE);
    }
}
