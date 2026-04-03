package com.docapost.supervision.interfaces;

import com.docapost.supervision.application.ConsulterDetailTourneeHandler;
import com.docapost.supervision.application.ConsulterTableauDeBordHandler;
import com.docapost.supervision.application.TourneeSupervisionNotFoundException;
import com.docapost.supervision.domain.model.*;
import com.docapost.supervision.interfaces.rest.SupervisionController;
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
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests @WebMvcTest — SupervisionController (US-011 + US-012)
 */
@WebMvcTest(SupervisionController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
class SupervisionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConsulterTableauDeBordHandler consulterTableauDeBordHandler;

    @MockBean
    private ConsulterDetailTourneeHandler consulterDetailTourneeHandler;

    @Test
    @DisplayName("GET /api/supervision/tableau-de-bord retourne 200 avec la liste des tournées")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getTableauDeBord_retourne_200_avec_tournees() throws Exception {
        TableauDeBord tableau = tableauAvecTroisTournees();
        when(consulterTableauDeBordHandler.handle(any())).thenReturn(tableau);

        mockMvc.perform(get("/api/supervision/tableau-de-bord")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tournees").isArray())
                .andExpect(jsonPath("$.tournees", hasSize(3)))
                .andExpect(jsonPath("$.bandeau.actives").value(2))
                .andExpect(jsonPath("$.bandeau.aRisque").value(1))
                .andExpect(jsonPath("$.bandeau.cloturees").value(0));
    }

    @Test
    @DisplayName("GET /api/supervision/tableau-de-bord?statut=A_RISQUE retourne les tournées filtrées")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getTableauDeBord_filtreParStatut_retourne_tournees_filtrees() throws Exception {
        VueTournee aRisque = new VueTournee("t-003", "Jean", 2, 12, StatutTourneeVue.A_RISQUE, Instant.now());
        TableauDeBord tableau = TableauDeBord.of(List.of(aRisque));
        when(consulterTableauDeBordHandler.handle(any())).thenReturn(tableau);

        mockMvc.perform(get("/api/supervision/tableau-de-bord?statut=A_RISQUE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tournees", hasSize(1)))
                .andExpect(jsonPath("$.tournees[0].statut").value("A_RISQUE"));
    }

    @Test
    @DisplayName("GET /api/supervision/tableau-de-bord retourne 403 si non-SUPERVISEUR")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getTableauDeBord_retourne_403_pour_livreur() throws Exception {
        mockMvc.perform(get("/api/supervision/tableau-de-bord")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/supervision/tableau-de-bord?statut=INVALIDE retourne 400")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getTableauDeBord_retourne_400_si_statut_invalide() throws Exception {
        mockMvc.perform(get("/api/supervision/tableau-de-bord?statut=INVALIDE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    // ─── Tests US-012 ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/supervision/tournees/{id} retourne 200 avec détail (SUPERVISEUR)")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getDetailTournee_retourne_200_avec_detail() throws Exception {
        VueTournee vueTournee = new VueTournee("t-001", "Pierre", 3, 5,
                StatutTourneeVue.EN_COURS, Instant.now());
        List<VueColis> colis = List.of(
                new VueColis("c-001", "12 rue de la Paix", "LIVRE", null, Instant.now())
        );
        List<IncidentVue> incidents = List.of(
                new IncidentVue("c-002", "5 av Victor Hugo", "ABSENT", Instant.now(), "Note")
        );
        VueTourneeDetail detail = new VueTourneeDetail(vueTournee, colis, incidents);

        when(consulterDetailTourneeHandler.handle(any())).thenReturn(detail);

        mockMvc.perform(get("/api/supervision/tournees/t-001")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tournee.tourneeId").value("t-001"))
                .andExpect(jsonPath("$.colis").isArray())
                .andExpect(jsonPath("$.colis", hasSize(1)))
                .andExpect(jsonPath("$.incidents").isArray())
                .andExpect(jsonPath("$.incidents", hasSize(1)));
    }

    @Test
    @DisplayName("GET /api/supervision/tournees/{id} retourne 404 si tournée introuvable")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getDetailTournee_retourne_404_si_introuvable() throws Exception {
        when(consulterDetailTourneeHandler.handle(any()))
                .thenThrow(new TourneeSupervisionNotFoundException("t-inconnu"));

        mockMvc.perform(get("/api/supervision/tournees/t-inconnu")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    // ─── Tests US-035 ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("US-035 — GET /api/supervision/tableau-de-bord expose codeTMS et zone dans chaque tournée")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getTableauDeBord_expose_codeTMS_et_zone() throws Exception {
        TableauDeBord tableau = TableauDeBord.of(List.of(
                new VueTournee("t-001", "Pierre", 3, 10, StatutTourneeVue.EN_COURS,
                        Instant.now(), "T-201", "Lyon 3e"),
                new VueTournee("t-002", "Marie", 7, 10, StatutTourneeVue.EN_COURS,
                        Instant.now(), "T-202", "Villeurbanne")
        ));
        when(consulterTableauDeBordHandler.handle(any())).thenReturn(tableau);

        mockMvc.perform(get("/api/supervision/tableau-de-bord")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tournees[0].codeTMS").value("T-201"))
                .andExpect(jsonPath("$.tournees[0].zone").value("Lyon 3e"))
                .andExpect(jsonPath("$.tournees[1].codeTMS").value("T-202"))
                .andExpect(jsonPath("$.tournees[1].zone").value("Villeurbanne"));
    }

    @Test
    @DisplayName("US-035 — codeTMS et zone null si non renseignés (rétrocompatibilité)")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getTableauDeBord_codeTMS_zone_nullable() throws Exception {
        TableauDeBord tableau = TableauDeBord.of(List.of(
                new VueTournee("t-001", "Pierre", 3, 10, StatutTourneeVue.EN_COURS, Instant.now())
        ));
        when(consulterTableauDeBordHandler.handle(any())).thenReturn(tableau);

        mockMvc.perform(get("/api/supervision/tableau-de-bord")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tournees[0].codeTMS").doesNotExist());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private TableauDeBord tableauAvecTroisTournees() {
        return TableauDeBord.of(List.of(
                new VueTournee("t-001", "Pierre", 3, 10, StatutTourneeVue.EN_COURS,
                        Instant.now(), "T-201", "Lyon 3e"),
                new VueTournee("t-002", "Marie", 7, 10, StatutTourneeVue.EN_COURS,
                        Instant.now(), "T-202", "Villeurbanne"),
                new VueTournee("t-003", "Jean", 2, 12, StatutTourneeVue.A_RISQUE,
                        Instant.now(), "T-203", "Lyon 3e")
        ));
    }
}
