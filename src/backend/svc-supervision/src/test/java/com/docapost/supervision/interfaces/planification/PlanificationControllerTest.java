package com.docapost.supervision.interfaces.planification;

import com.docapost.supervision.application.planification.*;
import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.domain.planification.model.*;
import com.docapost.supervision.interfaces.planification.rest.PlanificationController;
import com.docapost.supervision.interfaces.security.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests @WebMvcTest — PlanificationController (US-021 à US-024)
 */
@WebMvcTest(PlanificationController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
class PlanificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private ConsulterPlanDuJourHandler consulterPlanDuJourHandler;
    @MockBean private ConsulterDetailTourneePlanifieeHandler consulterDetailHandler;
    @MockBean private ValiderCompositionHandler validerCompositionHandler;
    @MockBean private AffecterLivreurVehiculeHandler affecterHandler;
    @MockBean private LancerTourneeHandler lancerTourneeHandler;

    // ─── US-021 : Visualiser plan du jour ─────────────────────────────────────

    @Test
    @DisplayName("GET /api/planification/plans/{date} retourne 200 avec plan du jour")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getPlanDuJour_retourne_200_avec_tournees() throws Exception {
        LocalDate today = LocalDate.now();
        List<TourneePlanifiee> tournees = List.of(
                tourneePlanifieeNonAffectee("tp-001", "T-201", today),
                tourneeAffectee("tp-002", "T-202", today)
        );
        when(consulterPlanDuJourHandler.handle(any())).thenReturn(tournees);

        mockMvc.perform(get("/api/planification/plans/" + today)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTournees").value(2))
                .andExpect(jsonPath("$.nonAffectees").value(1))
                .andExpect(jsonPath("$.affectees").value(1))
                .andExpect(jsonPath("$.tournees").isArray())
                .andExpect(jsonPath("$.tournees", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/planification/plans/{date} retourne 403 si non-SUPERVISEUR")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getPlanDuJour_retourne_403_pour_livreur() throws Exception {
        mockMvc.perform(get("/api/planification/plans/" + LocalDate.now()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/planification/plans/{date} retourne 400 si date invalide")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getPlanDuJour_retourne_400_si_date_invalide() throws Exception {
        mockMvc.perform(get("/api/planification/plans/INVALIDE"))
                .andExpect(status().isBadRequest());
    }

    // ─── US-022 : Vérifier composition ────────────────────────────────────────

    @Test
    @DisplayName("GET /api/planification/tournees/{id} retourne 200 avec composition")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getDetailTourneePlanifiee_retourne_200() throws Exception {
        TourneePlanifiee tournee = tourneeAvecAnomalie("tp-003", "T-203", LocalDate.now());
        when(consulterDetailHandler.handle(any())).thenReturn(tournee);

        mockMvc.perform(get("/api/planification/tournees/tp-003"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codeTms").value("T-203"))
                .andExpect(jsonPath("$.anomalies").isArray())
                .andExpect(jsonPath("$.anomalies", hasSize(1)))
                .andExpect(jsonPath("$.anomalies[0].code").value("SURCHARGE"))
                .andExpect(jsonPath("$.contraintes").isArray())
                .andExpect(jsonPath("$.zones", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/planification/tournees/{id} retourne 404 si introuvable")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getDetailTourneePlanifiee_retourne_404() throws Exception {
        when(consulterDetailHandler.handle(any()))
                .thenThrow(new TourneePlanifieeNotFoundException("tp-inconnu"));

        mockMvc.perform(get("/api/planification/tournees/tp-inconnu"))
                .andExpect(status().isNotFound());
    }

    // ─── US-023 : Affecter livreur + véhicule ─────────────────────────────────

    @Test
    @DisplayName("POST /api/planification/tournees/{id}/affecter retourne 200 si affectation réussie")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void affecterLivreurVehicule_retourne_200() throws Exception {
        TourneePlanifiee tourneeAffectee = tourneeAffectee("tp-001", "T-201", LocalDate.now());
        doNothing().when(affecterHandler).handle(any());
        when(consulterDetailHandler.handle(any())).thenReturn(tourneeAffectee);

        mockMvc.perform(post("/api/planification/tournees/tp-001/affecter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"livreurId":"livreur-001","livreurNom":"Pierre Morel","vehiculeId":"VH-07"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("AFFECTEE"));
    }

    @Test
    @DisplayName("POST /api/planification/tournees/{id}/affecter retourne 409 si livreur déjà affecté")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void affecterLivreurVehicule_retourne_409_si_livreur_deja_affecte() throws Exception {
        doThrow(new LivreurDejaAffecteException("livreur-001")).when(affecterHandler).handle(any());

        mockMvc.perform(post("/api/planification/tournees/tp-001/affecter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"livreurId":"livreur-001","livreurNom":"Pierre Morel","vehiculeId":"VH-07"}
                                """))
                .andExpect(status().isConflict());
    }

    // ─── US-024 : Lancer tournée ───────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/planification/tournees/{id}/lancer retourne 200 si lancement réussi")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void lancerTournee_retourne_200() throws Exception {
        TourneeLancee event = new TourneeLancee("tp-002", "T-202", "livreur-001", "Pierre Morel", "superviseur-001", Instant.now());
        TourneePlanifiee tourneeLancee = tourneeLancee("tp-002", "T-202", LocalDate.now());
        when(lancerTourneeHandler.handle(any())).thenReturn(event);
        when(consulterDetailHandler.handle(any())).thenReturn(tourneeLancee);

        mockMvc.perform(post("/api/planification/tournees/tp-002/lancer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("LANCEE"));
    }

    @Test
    @DisplayName("POST /api/planification/tournees/{id}/lancer retourne 409 si tournée non affectée")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void lancerTournee_retourne_409_si_non_affectee() throws Exception {
        when(lancerTourneeHandler.handle(any()))
                .thenThrow(new PlanificationInvariantException("Tournée non AFFECTEE"));

        mockMvc.perform(post("/api/planification/tournees/tp-001/lancer"))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /api/planification/plans/{date}/lancer-toutes retourne 200 avec compteur")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void lancerToutesLesTournees_retourne_200_avec_compteur() throws Exception {
        when(lancerTourneeHandler.lancerToutesLesTourneesAffectees(any())).thenReturn(3);

        mockMvc.perform(post("/api/planification/plans/" + LocalDate.now() + "/lancer-toutes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nbTourneesLancees").value(3))
                .andExpect(jsonPath("$.message").value("3 tournée(s) lancée(s) avec succès."));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TourneePlanifiee tourneePlanifieeNonAffectee(String id, String codeTms, LocalDate date) {
        return new TourneePlanifiee(
                id, codeTms, date, 34,
                List.of(new ZoneTournee("Lyon 3e", 20), new ZoneTournee("Lyon 6e", 14)),
                List.of(new ContrainteHoraire("Avant 10h", 5)),
                List.of(),
                Instant.now()
        );
    }

    private TourneePlanifiee tourneeAffectee(String id, String codeTms, LocalDate date) {
        return new TourneePlanifiee(
                id, codeTms, date, 28,
                List.of(new ZoneTournee("Villeurbanne", 28)),
                List.of(), List.of(),
                Instant.now(),
                StatutAffectation.AFFECTEE,
                "livreur-001", "Pierre Morel", "VH-07",
                Instant.now(), null, false
        );
    }

    private TourneePlanifiee tourneeLancee(String id, String codeTms, LocalDate date) {
        return new TourneePlanifiee(
                id, codeTms, date, 28,
                List.of(new ZoneTournee("Villeurbanne", 28)),
                List.of(), List.of(),
                Instant.now(),
                StatutAffectation.LANCEE,
                "livreur-001", "Pierre Morel", "VH-07",
                Instant.now().minusSeconds(60), Instant.now(), false
        );
    }

    private TourneePlanifiee tourneeAvecAnomalie(String id, String codeTms, LocalDate date) {
        return new TourneePlanifiee(
                id, codeTms, date, 41,
                List.of(new ZoneTournee("Lyon 8e", 27), new ZoneTournee("Lyon 5e", 14)),
                List.of(new ContrainteHoraire("Avant 10h00", 6)),
                List.of(new Anomalie("SURCHARGE", "41 colis dépasse le seuil de 35")),
                Instant.now()
        );
    }
}
