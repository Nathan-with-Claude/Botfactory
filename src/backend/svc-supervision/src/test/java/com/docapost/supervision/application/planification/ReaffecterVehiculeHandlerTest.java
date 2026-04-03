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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — ReaffecterVehiculeHandler (US-034)
 *
 * L'Application Service orchestre :
 * 1. Charger la tournée
 * 2. Charger le nouveau véhicule
 * 3. Vérifier la compatibilité via l'Aggregate (verifierCompatibiliteVehicule)
 * 4. Sauvegarder si compatible
 * 5. Retourner un CompatibiliteVehiculeResultatDTO
 *
 * Invariants :
 * - Si véhicule non trouvé → VehiculeNotFoundException
 * - Si tournée non trouvée → TourneePlanifieeNotFoundException
 * - Si véhicule insuffisant → CapaciteVehiculeDepasseeException (pas de sauvegarde)
 * - Si véhicule compatible → CompatibiliteVehiculeVerifiee émis + sauvegarde
 */
@ExtendWith(MockitoExtension.class)
class ReaffecterVehiculeHandlerTest {

    @Mock
    private TourneePlanifieeRepository tourneePlanifieeRepository;

    @Mock
    private VehiculeRepository vehiculeRepository;

    private ReaffecterVehiculeHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ReaffecterVehiculeHandler(tourneePlanifieeRepository, vehiculeRepository);
    }

    // ─── SC3 US-034 : Réaffectation vers véhicule compatible ──────────────────

    @Test
    @DisplayName("SC3 US-034 — réaffectation vers véhicule compatible (410 kg / 600 kg) retourne COMPATIBLE")
    void handle_reaffectation_vers_vehicule_compatible_retourne_compatible() {
        TourneePlanifiee tournee = tourneeAvecPoids("tp-030", 410);
        Vehicule vehicule = vehiculeCapacite("VH-02", 600);

        when(tourneePlanifieeRepository.findById("tp-030")).thenReturn(Optional.of(tournee));
        when(vehiculeRepository.findById(new VehiculeId("VH-02"))).thenReturn(Optional.of(vehicule));

        CompatibiliteVehiculeResultatDTO resultat = handler.handle(
                new ReaffecterVehiculeCommand("tp-030", "VH-02", "superviseur-001")
        );

        assertThat(resultat.resultat()).isEqualTo(ResultatCompatibilite.COMPATIBLE);
        assertThat(resultat.poidsEstimeKg()).isEqualTo(410);
        assertThat(resultat.capaciteKg()).isEqualTo(600);
        assertThat(resultat.margeOuDepassementKg()).isEqualTo(190);
        verify(tourneePlanifieeRepository).save(tournee);
    }

    // ─── SC3 US-034 : Réaffectation vers véhicule insuffisant ─────────────────

    @Test
    @DisplayName("SC3 US-034 — réaffectation vers véhicule encore insuffisant lève exception, pas de sauvegarde")
    void handle_reaffectation_vers_vehicule_insuffisant_leve_exception() {
        TourneePlanifiee tournee = tourneeAvecPoids("tp-030", 410);
        Vehicule vehicule = vehiculeCapacite("VH-06", 300);

        when(tourneePlanifieeRepository.findById("tp-030")).thenReturn(Optional.of(tournee));
        when(vehiculeRepository.findById(new VehiculeId("VH-06"))).thenReturn(Optional.of(vehicule));

        assertThatThrownBy(() -> handler.handle(
                new ReaffecterVehiculeCommand("tp-030", "VH-06", "superviseur-001")
        )).isInstanceOf(CapaciteVehiculeDepasseeException.class);

        verify(tourneePlanifieeRepository, never()).save(any());
    }

    // ─── SC4 US-034 : Aucun véhicule compatible disponible ────────────────────

    @Test
    @DisplayName("SC4 US-034 — requête des véhicules compatibles retourne liste filtrée par capacité")
    void rechercherVehiculesCompatibles_retourne_uniquement_vehicules_suffisants() {
        int poidsMinKg = 410;
        List<Vehicule> tousLesVehicules = List.of(
                vehiculeCapacite("VH-06", 300),   // insuffisant
                vehiculeCapacite("VH-09", 150),   // insuffisant
                vehiculeCapacite("VH-02", 600),   // compatible
                vehiculeCapacite("VH-01", 800),   // compatible
                vehiculeCapacite("VH-04", 700)    // compatible
        );
        when(vehiculeRepository.findDisponibles(any())).thenReturn(tousLesVehicules);

        List<Vehicule> compatibles = handler.rechercherVehiculesCompatibles(poidsMinKg, LocalDate.now());

        assertThat(compatibles).hasSize(3);
        assertThat(compatibles).extracting(v -> v.getVehiculeId().getValeur())
                .containsExactlyInAnyOrder("VH-02", "VH-01", "VH-04");
    }

    @Test
    @DisplayName("SC4 US-034 — aucun véhicule compatible retourne liste vide")
    void rechercherVehiculesCompatibles_retourne_vide_si_aucun_compatible() {
        int poidsMinKg = 1000;
        List<Vehicule> tousLesVehicules = List.of(
                vehiculeCapacite("VH-06", 300),
                vehiculeCapacite("VH-09", 150)
        );
        when(vehiculeRepository.findDisponibles(any())).thenReturn(tousLesVehicules);

        List<Vehicule> compatibles = handler.rechercherVehiculesCompatibles(poidsMinKg, LocalDate.now());

        assertThat(compatibles).isEmpty();
    }

    // ─── Cas d'erreur ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("lève TourneePlanifieeNotFoundException si tournée introuvable")
    void handle_tournee_introuvable_leve_not_found() {
        when(tourneePlanifieeRepository.findById("tp-inconnu")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(
                new ReaffecterVehiculeCommand("tp-inconnu", "VH-02", "superviseur-001")
        )).isInstanceOf(TourneePlanifieeNotFoundException.class);
    }

    @Test
    @DisplayName("lève VehiculeNotFoundException si véhicule introuvable")
    void handle_vehicule_introuvable_leve_not_found() {
        TourneePlanifiee tournee = tourneeAvecPoids("tp-030", 410);
        when(tourneePlanifieeRepository.findById("tp-030")).thenReturn(Optional.of(tournee));
        when(vehiculeRepository.findById(new VehiculeId("VH-inconnu"))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(
                new ReaffecterVehiculeCommand("tp-030", "VH-inconnu", "superviseur-001")
        )).isInstanceOf(VehiculeNotFoundException.class);
    }

    @Test
    @DisplayName("lève IllegalArgumentException si commande null")
    void handle_commande_null_leve_exception() {
        assertThatThrownBy(() -> handler.handle(null))
                .isInstanceOf(NullPointerException.class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneeAvecPoids(String id, Integer poidsEstimeKg) {
        return new TourneePlanifiee(
                id, "T-034", LocalDate.now(), 40,
                List.of(new ZoneTournee("Lyon 3e", 40)),
                List.of(), List.of(),
                Instant.now(),
                poidsEstimeKg
        );
    }

    private Vehicule vehiculeCapacite(String vehiculeId, int capaciteKg) {
        return new Vehicule(new VehiculeId(vehiculeId), vehiculeId, capaciteKg, TypeVehicule.FOURGON);
    }
}
