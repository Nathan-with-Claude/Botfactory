package com.docapost.tournee.interfaces;

import com.docapost.tournee.application.CloturerTourneeHandler;
import com.docapost.tournee.application.RecapitulatifTourneeResult;
import com.docapost.tournee.application.TourneeNotFoundException;
import com.docapost.tournee.domain.model.StatutTournee;
import com.docapost.tournee.domain.model.TourneeInvariantException;
import com.docapost.tournee.interfaces.rest.TourneeController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'integration de la couche REST — POST /api/tournees/{tourneeId}/cloture
 * US-007 : Cloture de tournee.
 *
 * Verifie :
 * - 200 avec RecapitulatifTourneeDTO si cloture reussie
 * - 404 si tournee introuvable
 * - 409 si des colis sont encore a livrer
 * - 401 si non authentifie
 */
@WebMvcTest(TourneeController.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
class CloturerTourneeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.docapost.tournee.application.ConsulterListeColisHandler consulterListeColisHandler;

    @MockBean
    private com.docapost.tournee.application.ConsulterDetailColisHandler consulterDetailColisHandler;

    @MockBean
    private com.docapost.tournee.application.DeclarerEchecLivraisonHandler declarerEchecLivraisonHandler;

    @MockBean
    private CloturerTourneeHandler cloturerTourneeHandler;

    @MockBean
    private com.docapost.tournee.application.ConfirmerLivraisonHandler confirmerLivraisonHandler;

    private static final String TOURNEE_ID = "tournee-001";

    @Test
    @DisplayName("POST /api/tournees/{tourneeId}/cloture retourne 200 avec le recapitulatif")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void cloturerTournee_retourne_200_avec_recap() throws Exception {
        RecapitulatifTourneeResult recap = unRecapitulatif();
        when(cloturerTourneeHandler.handle(any())).thenReturn(recap);

        mockMvc.perform(post("/api/tournees/{tourneeId}/cloture", TOURNEE_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tourneeId").value(TOURNEE_ID))
                .andExpect(jsonPath("$.statut").value("CLOTUREE"))
                .andExpect(jsonPath("$.colisTotal").value(4))
                .andExpect(jsonPath("$.colisLivres").value(2))
                .andExpect(jsonPath("$.colisEchecs").value(1))
                .andExpect(jsonPath("$.colisARepresenter").value(1));
    }

    @Test
    @DisplayName("POST /cloture retourne 404 si la tournee n'existe pas")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void cloturerTournee_retourne_404_si_tournee_introuvable() throws Exception {
        when(cloturerTourneeHandler.handle(any()))
                .thenThrow(new TourneeNotFoundException(TOURNEE_ID, null));

        mockMvc.perform(post("/api/tournees/{tourneeId}/cloture", TOURNEE_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /cloture retourne 409 si des colis sont encore a livrer")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void cloturerTournee_retourne_409_si_colis_a_livrer() throws Exception {
        when(cloturerTourneeHandler.handle(any()))
                .thenThrow(new TourneeInvariantException("Certains colis sont encore en statut a livrer"));

        mockMvc.perform(post("/api/tournees/{tourneeId}/cloture", TOURNEE_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /cloture retourne 401 si non authentifie")
    void cloturerTournee_retourne_401_si_non_authentifie() throws Exception {
        mockMvc.perform(post("/api/tournees/{tourneeId}/cloture", TOURNEE_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private RecapitulatifTourneeResult unRecapitulatif() {
        return new RecapitulatifTourneeResult(
                TOURNEE_ID,
                "livreur-001",
                LocalDate.now(),
                StatutTournee.CLOTUREE,
                4,
                2,
                1,
                1
        );
    }
}
