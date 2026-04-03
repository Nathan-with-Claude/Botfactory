package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.planification.repository.VehiculeRepository;
import com.docapost.supervision.interfaces.planification.dto.VehiculeCompatibleDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — ConsulterVehiculesCompatiblesHandler (US-034)
 *
 * Ce handler filtre les véhicules disponibles dont la capacité est >= poidsMinKg,
 * utilisé après un échec de compatibilité pour proposer une réaffectation.
 */
@ExtendWith(MockitoExtension.class)
class ConsulterVehiculesCompatiblesHandlerTest {

    @Mock
    private VehiculeRepository vehiculeRepository;

    private ConsulterVehiculesCompatiblesHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ConsulterVehiculesCompatiblesHandler(vehiculeRepository);
    }

    // ─── SC1 : Véhicules filtrés par capacité suffisante ──────────────────────

    @Test
    @DisplayName("SC1 — retourne uniquement les véhicules de capacité >= poidsMinKg")
    void handle_filtre_vehicules_par_capacite_suffisante() {
        // Flotte : VH-09 (150 kg), VH-06 (300 kg), VH-07 (600 kg), VH-01 (800 kg)
        when(vehiculeRepository.findDisponibles(any(LocalDate.class))).thenReturn(List.of(
                new Vehicule(new VehiculeId("VH-09"), "VH-09", 150, TypeVehicule.CARGO_VELO),
                new Vehicule(new VehiculeId("VH-06"), "VH-06", 300, TypeVehicule.UTILITAIRE_LEGER),
                new Vehicule(new VehiculeId("VH-07"), "VH-07", 600, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-01"), "VH-01", 800, TypeVehicule.FOURGON)
        ));

        List<VehiculeCompatibleDTO> result = handler.handle(
                new ConsulterVehiculesCompatiblesQuery(410)
        );

        // Seuls VH-07 (600 kg) et VH-01 (800 kg) sont >= 410 kg
        assertThat(result).hasSize(2);
        assertThat(result).extracting(VehiculeCompatibleDTO::vehiculeId)
                .containsExactly("VH-07", "VH-01"); // trié par capacité croissante
    }

    @Test
    @DisplayName("SC1 — les DTOs contiennent la marge correcte par rapport au poids estimé")
    void handle_calcule_marges_correctes() {
        when(vehiculeRepository.findDisponibles(any(LocalDate.class))).thenReturn(List.of(
                new Vehicule(new VehiculeId("VH-07"), "VH-07", 600, TypeVehicule.FOURGON)
        ));

        List<VehiculeCompatibleDTO> result = handler.handle(
                new ConsulterVehiculesCompatiblesQuery(410)
        );

        assertThat(result).hasSize(1);
        VehiculeCompatibleDTO dto = result.get(0);
        assertThat(dto.vehiculeId()).isEqualTo("VH-07");
        assertThat(dto.capaciteKg()).isEqualTo(600);
        assertThat(dto.margeKg()).isEqualTo(190); // 600 - 410
        assertThat(dto.disponible()).isTrue();
    }

    // ─── SC4 : Aucun véhicule compatible ──────────────────────────────────────

    @Test
    @DisplayName("SC4 — retourne liste vide si aucun véhicule n'a une capacité suffisante")
    void handle_retourne_liste_vide_si_aucun_compatible() {
        when(vehiculeRepository.findDisponibles(any(LocalDate.class))).thenReturn(List.of(
                new Vehicule(new VehiculeId("VH-09"), "VH-09", 150, TypeVehicule.CARGO_VELO),
                new Vehicule(new VehiculeId("VH-06"), "VH-06", 300, TypeVehicule.UTILITAIRE_LEGER)
        ));

        List<VehiculeCompatibleDTO> result = handler.handle(
                new ConsulterVehiculesCompatiblesQuery(410)
        );

        assertThat(result).isEmpty();
    }

    // ─── Tri par capacité croissante ──────────────────────────────────────────

    @Test
    @DisplayName("Les véhicules compatibles sont triés par capacité croissante")
    void handle_trie_par_capacite_croissante() {
        when(vehiculeRepository.findDisponibles(any(LocalDate.class))).thenReturn(List.of(
                new Vehicule(new VehiculeId("VH-01"), "VH-01", 800, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-04"), "VH-04", 700, TypeVehicule.FOURGON),
                new Vehicule(new VehiculeId("VH-07"), "VH-07", 600, TypeVehicule.FOURGON)
        ));

        List<VehiculeCompatibleDTO> result = handler.handle(
                new ConsulterVehiculesCompatiblesQuery(500)
        );

        // Doit être trié croissant : 600, 700, 800
        assertThat(result).extracting(VehiculeCompatibleDTO::capaciteKg)
                .containsExactly(600, 700, 800);
    }

    // ─── Véhicule exactement à la limite (>=) ─────────────────────────────────

    @Test
    @DisplayName("Un véhicule de capacité exactement égale au poids minimum est inclus")
    void handle_inclut_vehicule_capacite_exactement_egale() {
        when(vehiculeRepository.findDisponibles(any(LocalDate.class))).thenReturn(List.of(
                new Vehicule(new VehiculeId("VH-07"), "VH-07", 410, TypeVehicule.FOURGON)
        ));

        List<VehiculeCompatibleDTO> result = handler.handle(
                new ConsulterVehiculesCompatiblesQuery(410)
        );

        assertThat(result).hasSize(1);
        assertThat(result.get(0).margeKg()).isEqualTo(0); // 410 - 410 = 0 kg de marge
    }

    // ─── Garde-fous ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("Lève IllegalArgumentException si poidsMinKg <= 0")
    void query_leve_exception_si_poids_negatif() {
        assertThatThrownBy(() -> new ConsulterVehiculesCompatiblesQuery(0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new ConsulterVehiculesCompatiblesQuery(-1))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Lève NullPointerException si la query est null")
    void handle_leve_npe_si_query_null() {
        assertThatThrownBy(() -> handler.handle(null))
                .isInstanceOf(NullPointerException.class);
    }
}
