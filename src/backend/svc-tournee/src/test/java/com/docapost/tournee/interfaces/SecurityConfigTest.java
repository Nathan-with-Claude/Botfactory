package com.docapost.tournee.interfaces;

import com.docapost.tournee.application.*;
import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.interfaces.rest.TourneeController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests de la configuration Spring Security — US-019/020
 *
 * Valide les invariants d'autorisation dans svc-tournee :
 *  - SC1 US-019 : LIVREUR peut accéder à GET /api/tournees/today (200)
 *  - SC1 US-020 : SUPERVISEUR peut accéder à GET /api/tournees/today (200)
 *  - Non authentifié : 401 sur les routes protégées
 *
 * Note : le test 403 LIVREUR sur /api/supervision/** est couvert dans svc-supervision.
 *        Dans svc-tournee, le 403 LIVREUR sur /api/preuves/** est couvert par PreuveControllerTest.
 */
@WebMvcTest(controllers = TourneeController.class)
@DisplayName("US-019/020 — Configuration Spring Security — Invariants d'autorisation")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConsulterListeColisHandler consulterListeColisHandler;

    @MockBean
    private ConsulterDetailColisHandler consulterDetailColisHandler;

    @MockBean
    private DeclarerEchecLivraisonHandler declarerEchecLivraisonHandler;

    @MockBean
    private ConfirmerLivraisonHandler confirmerLivraisonHandler;

    @MockBean
    private CloturerTourneeHandler cloturerTourneeHandler;

    @MockBean
    private com.docapost.tournee.infrastructure.supervision.SupervisionNotifier supervisionNotifier;

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private Tournee creerTourneeTest() {
        return new Tournee(
                new TourneeId("tournee-001"),
                new LivreurId("livreur-001"),
                LocalDate.now(),
                List.of(),
                StatutTournee.CHARGEE
        );
    }

    // ─── Tests US-019 — Rôle LIVREUR ─────────────────────────────────────────

    @Test
    @WithMockUser(username = "livreur-001", roles = {"LIVREUR"})
    @DisplayName("SC1 US-019 — LIVREUR peut accéder à GET /api/tournees/today (200)")
    void livreur_peutAccederTournees() throws Exception {
        when(consulterListeColisHandler.handle(any())).thenReturn(creerTourneeTest());

        mockMvc.perform(get("/api/tournees/today"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Accès non authentifié → 401 sur les routes protégées")
    void nonAuthentifie_recoitUnauthorized() throws Exception {
        mockMvc.perform(get("/api/tournees/today"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "superviseur-001", roles = {"SUPERVISEUR"})
    @DisplayName("SC1 US-020 — SUPERVISEUR autorisé sur GET /api/tournees/today (200)")
    void superviseur_peutAccederTournees() throws Exception {
        when(consulterListeColisHandler.handle(any())).thenReturn(creerTourneeTest());

        mockMvc.perform(get("/api/tournees/today"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deuxième accès sans auth → confirme la règle 401")
    void sansAuth_confirme401() throws Exception {
        mockMvc.perform(get("/api/tournees/today"))
                .andExpect(status().isUnauthorized());
    }
}
