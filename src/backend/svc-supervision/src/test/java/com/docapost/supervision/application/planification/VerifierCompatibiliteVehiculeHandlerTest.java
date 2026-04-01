package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import com.docapost.supervision.domain.planification.repository.VehiculeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — VerifierCompatibiliteVehiculeHandler (US-030)
 *
 * L'Application Service orchestre :
 * 1. Récupérer la TourneePlanifiee
 * 2. Récupérer le Vehicule
 * 3. Déléguer la vérification à l'Aggregate
 * 4. Sauvegarder si nécessaire (event émis)
 */
@ExtendWith(MockitoExtension.class)
class VerifierCompatibiliteVehiculeHandlerTest {

    @Mock
    private TourneePlanifieeRepository tourneePlanifieeRepository;

    @Mock
    private VehiculeRepository vehiculeRepository;

    private VerifierCompatibiliteVehiculeHandler handler;

    @BeforeEach
    void setUp() {
        handler = new VerifierCompatibiliteVehiculeHandler(tourneePlanifieeRepository, vehiculeRepository);
    }

    // ─── SC1 : Véhicule compatible ─────────────────────────────────────────────

    @Test
    @DisplayName("SC1 — véhicule compatible (350 kg / 500 kg) retourne COMPATIBLE, sauvegarde event")
    void handle_vehicule_compatible_retourne_compatible() {
        TourneePlanifiee tournee = tourneeAvecPoids("tp-030", 350);
        Vehicule vehicule = vehiculeCapacite("VH-07", 500);

        when(tourneePlanifieeRepository.findById("tp-030")).thenReturn(Optional.of(tournee));
        when(vehiculeRepository.findById(new VehiculeId("VH-07"))).thenReturn(Optional.of(vehicule));

        CompatibiliteVehiculeResultatDTO resultat = handler.handle(
                new VerifierCompatibiliteVehiculeCommand("tp-030", "VH-07", false, "superviseur-001")
        );

        assertThat(resultat.resultat()).isEqualTo(ResultatCompatibilite.COMPATIBLE);
        assertThat(resultat.poidsEstimeKg()).isEqualTo(350);
        assertThat(resultat.capaciteKg()).isEqualTo(500);
        assertThat(resultat.margeOuDepassementKg()).isEqualTo(150);
        verify(tourneePlanifieeRepository).save(tournee);
    }

    // ─── SC2 : Véhicule insuffisant sans forçage ────────────────────────────────

    @Test
    @DisplayName("SC2 — véhicule insuffisant sans forçage lève CapaciteVehiculeDepasseeException")
    void handle_vehicule_insuffisant_leve_exception() {
        TourneePlanifiee tournee = tourneeAvecPoids("tp-030", 410);
        Vehicule vehicule = vehiculeCapacite("VH-07", 400);

        when(tourneePlanifieeRepository.findById("tp-030")).thenReturn(Optional.of(tournee));
        when(vehiculeRepository.findById(new VehiculeId("VH-07"))).thenReturn(Optional.of(vehicule));

        assertThatThrownBy(() -> handler.handle(
                new VerifierCompatibiliteVehiculeCommand("tp-030", "VH-07", false, "superviseur-001")
        )).isInstanceOf(CapaciteVehiculeDepasseeException.class);

        // Aucune sauvegarde en cas d'exception
        verify(tourneePlanifieeRepository, never()).save(any());
    }

    // ─── SC3 : Forçage malgré dépassement ─────────────────────────────────────

    @Test
    @DisplayName("SC3 — forçage malgré dépassement retourne DEPASSEMENT, sauvegarde event echouee")
    void handle_forcer_depassement_retourne_depassement() {
        TourneePlanifiee tournee = tourneeAvecPoids("tp-030", 410);
        Vehicule vehicule = vehiculeCapacite("VH-07", 400);

        when(tourneePlanifieeRepository.findById("tp-030")).thenReturn(Optional.of(tournee));
        when(vehiculeRepository.findById(new VehiculeId("VH-07"))).thenReturn(Optional.of(vehicule));

        CompatibiliteVehiculeResultatDTO resultat = handler.handle(
                new VerifierCompatibiliteVehiculeCommand("tp-030", "VH-07", true, "superviseur-001")
        );

        assertThat(resultat.resultat()).isEqualTo(ResultatCompatibilite.DEPASSEMENT);
        assertThat(resultat.margeOuDepassementKg()).isEqualTo(10); // dépassement = 410 - 400
        verify(tourneePlanifieeRepository).save(tournee);
    }

    // ─── SC4 : Poids absent ─────────────────────────────────────────────────────

    @Test
    @DisplayName("SC4 — poids absent retourne POIDS_ABSENT, aucune sauvegarde")
    void handle_poids_absent_retourne_poids_absent() {
        TourneePlanifiee tournee = tourneeSansPoids("tp-030");
        Vehicule vehicule = vehiculeCapacite("VH-07", 500);

        when(tourneePlanifieeRepository.findById("tp-030")).thenReturn(Optional.of(tournee));
        when(vehiculeRepository.findById(new VehiculeId("VH-07"))).thenReturn(Optional.of(vehicule));

        CompatibiliteVehiculeResultatDTO resultat = handler.handle(
                new VerifierCompatibiliteVehiculeCommand("tp-030", "VH-07", false, "superviseur-001")
        );

        assertThat(resultat.resultat()).isEqualTo(ResultatCompatibilite.POIDS_ABSENT);
        assertThat(resultat.poidsEstimeKg()).isNull();
        // Pas de sauvegarde si poids absent (aucun event émis)
        verify(tourneePlanifieeRepository, never()).save(any());
    }

    // ─── Cas d'erreur ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("lève TourneePlanifieeNotFoundException si tournée introuvable")
    void handle_tournee_introuvable_leve_not_found() {
        when(tourneePlanifieeRepository.findById("tp-inconnu")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(
                new VerifierCompatibiliteVehiculeCommand("tp-inconnu", "VH-07", false, "superviseur-001")
        )).isInstanceOf(TourneePlanifieeNotFoundException.class);
    }

    @Test
    @DisplayName("lève VehiculeNotFoundException si véhicule introuvable")
    void handle_vehicule_introuvable_leve_not_found() {
        TourneePlanifiee tournee = tourneeAvecPoids("tp-030", 350);
        when(tourneePlanifieeRepository.findById("tp-030")).thenReturn(Optional.of(tournee));
        when(vehiculeRepository.findById(new VehiculeId("VH-inconnu"))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(
                new VerifierCompatibiliteVehiculeCommand("tp-030", "VH-inconnu", false, "superviseur-001")
        )).isInstanceOf(VehiculeNotFoundException.class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneeAvecPoids(String id, Integer poidsEstimeKg) {
        return new TourneePlanifiee(
                id, "T-030", LocalDate.now(), 40,
                List.of(new ZoneTournee("Lyon 3e", 40)),
                List.of(), List.of(),
                Instant.now(),
                poidsEstimeKg
        );
    }

    private TourneePlanifiee tourneeSansPoids(String id) {
        return tourneeAvecPoids(id, null);
    }

    private Vehicule vehiculeCapacite(String vehiculeId, int capaciteKg) {
        return new Vehicule(new VehiculeId(vehiculeId), vehiculeId, capaciteKg, TypeVehicule.FOURGON);
    }
}
