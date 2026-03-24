package com.docapost.supervision.application.planification;

import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests TDD — AffecterLivreurVehiculeHandler (US-023)
 */
@ExtendWith(MockitoExtension.class)
class AffecterLivreurVehiculeHandlerTest {

    @Mock
    private TourneePlanifieeRepository repository;

    private AffecterLivreurVehiculeHandler handler;

    @BeforeEach
    void setUp() {
        handler = new AffecterLivreurVehiculeHandler(repository);
    }

    @Test
    @DisplayName("affecte correctement un livreur et un véhicule à une tournée non affectée")
    void handle_affecte_livreur_et_vehicule_correctement() {
        TourneePlanifiee tournee = tourneeNonAffectee("tp-001", "T-201");
        when(repository.findById("tp-001")).thenReturn(Optional.of(tournee));
        when(repository.isLivreurDejaAffecte("livreur-001", tournee.getDate())).thenReturn(false);
        when(repository.isVehiculeDejaAffecte("VH-07", tournee.getDate())).thenReturn(false);

        handler.handle(new AffecterLivreurVehiculeCommand("tp-001", "livreur-001", "Pierre Morel", "VH-07", "superviseur-001"));

        assertThat(tournee.getStatut()).isEqualTo(StatutAffectation.AFFECTEE);
        assertThat(tournee.getLivreurId()).isEqualTo("livreur-001");
        assertThat(tournee.getVehiculeId()).isEqualTo("VH-07");
        verify(repository).save(tournee);
    }

    @Test
    @DisplayName("lève LivreurDejaAffecteException si livreur déjà affecté à une autre tournée")
    void handle_leve_exception_si_livreur_deja_affecte() {
        TourneePlanifiee tournee = tourneeNonAffectee("tp-001", "T-201");
        when(repository.findById("tp-001")).thenReturn(Optional.of(tournee));
        when(repository.isLivreurDejaAffecte("livreur-001", tournee.getDate())).thenReturn(true);

        assertThatThrownBy(() -> handler.handle(
                new AffecterLivreurVehiculeCommand("tp-001", "livreur-001", "Pierre Morel", "VH-07", "superviseur-001")
        )).isInstanceOf(LivreurDejaAffecteException.class);
    }

    @Test
    @DisplayName("lève VehiculeDejaAffecteException si véhicule déjà affecté à une autre tournée")
    void handle_leve_exception_si_vehicule_deja_affecte() {
        TourneePlanifiee tournee = tourneeNonAffectee("tp-001", "T-201");
        when(repository.findById("tp-001")).thenReturn(Optional.of(tournee));
        when(repository.isLivreurDejaAffecte("livreur-001", tournee.getDate())).thenReturn(false);
        when(repository.isVehiculeDejaAffecte("VH-07", tournee.getDate())).thenReturn(true);

        assertThatThrownBy(() -> handler.handle(
                new AffecterLivreurVehiculeCommand("tp-001", "livreur-001", "Pierre Morel", "VH-07", "superviseur-001")
        )).isInstanceOf(VehiculeDejaAffecteException.class);
    }

    @Test
    @DisplayName("lève TourneePlanifieeNotFoundException si tournée introuvable")
    void handle_leve_not_found_si_tournee_introuvable() {
        when(repository.findById("tp-inconnu")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(
                new AffecterLivreurVehiculeCommand("tp-inconnu", "livreur-001", "Pierre Morel", "VH-07", "superviseur-001")
        )).isInstanceOf(TourneePlanifieeNotFoundException.class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneeNonAffectee(String id, String codeTms) {
        return new TourneePlanifiee(
                id, codeTms, LocalDate.now(), 30,
                List.of(new ZoneTournee("Lyon 3e", 30)),
                List.of(),
                List.of(),
                Instant.now()
        );
    }
}
