package com.docapost.tournee.interfaces;

import com.docapost.tournee.application.ColisNotFoundException;
import com.docapost.tournee.application.DeclarerEchecLivraisonHandler;
import com.docapost.tournee.application.ConsulterDetailColisHandler;
import com.docapost.tournee.application.ConsulterListeColisHandler;
import com.docapost.tournee.application.TourneeNotFoundException;
import com.docapost.tournee.domain.model.*;
import com.docapost.tournee.interfaces.rest.TourneeController;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration couche REST — endpoint POST /echec (US-005)
 */
@WebMvcTest(TourneeController.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
@DisplayName("US-005 — EchecLivraisonController (POST /api/tournees/{id}/colis/{id}/echec)")
class EchecLivraisonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ConsulterListeColisHandler consulterListeColisHandler;

    @MockBean
    private ConsulterDetailColisHandler consulterDetailColisHandler;

    @MockBean
    private DeclarerEchecLivraisonHandler declarerEchecLivraisonHandler;

    @MockBean
    private com.docapost.tournee.application.CloturerTourneeHandler cloturerTourneeHandler;

    @MockBean
    private com.docapost.tournee.application.ConfirmerLivraisonHandler confirmerLivraisonHandler;

    private static final TourneeId TOURNEE_ID = new TourneeId("tournee-001");

    private Colis unColisEchec() {
        return new Colis(
                new ColisId("colis-001"),
                TOURNEE_ID,
                StatutColis.ECHEC,
                new Adresse("12 Rue du Port", null, "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                List.of(),
                MotifNonLivraison.ABSENT,
                Disposition.A_REPRESENTER
        );
    }

    @Test
    @DisplayName("POST /echec retourne 200 avec le colis mis à jour")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postEchec_retourne_200_avec_colis_echec() throws Exception {
        when(declarerEchecLivraisonHandler.handle(any())).thenReturn(unColisEchec());

        Map<String, Object> body = Map.of(
                "motif", "ABSENT",
                "disposition", "A_REPRESENTER"
        );

        mockMvc.perform(post("/api/tournees/tournee-001/colis/colis-001/echec")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("ECHEC"))
                .andExpect(jsonPath("$.motifNonLivraison").value("ABSENT"))
                .andExpect(jsonPath("$.disposition").value("A_REPRESENTER"));
    }

    @Test
    @DisplayName("POST /echec retourne 404 si la tournée n'existe pas")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postEchec_retourne_404_si_tournee_inconnue() throws Exception {
        when(declarerEchecLivraisonHandler.handle(any()))
                .thenThrow(new TourneeNotFoundException("tournee-001", LocalDate.now()));

        Map<String, Object> body = Map.of(
                "motif", "ABSENT",
                "disposition", "A_REPRESENTER"
        );

        mockMvc.perform(post("/api/tournees/tournee-001/colis/colis-001/echec")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /echec retourne 404 si le colis n'existe pas dans la tournée")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postEchec_retourne_404_si_colis_inconnu() throws Exception {
        when(declarerEchecLivraisonHandler.handle(any()))
                .thenThrow(new ColisNotFoundException("tournee-001", "colis-INCONNU"));

        Map<String, Object> body = Map.of(
                "motif", "ABSENT",
                "disposition", "A_REPRESENTER"
        );

        mockMvc.perform(post("/api/tournees/tournee-001/colis/colis-INCONNU/echec")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /echec retourne 409 si le colis est déjà en ECHEC")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postEchec_retourne_409_si_colis_deja_echec() throws Exception {
        when(declarerEchecLivraisonHandler.handle(any()))
                .thenThrow(new TourneeInvariantException("Transition interdite : colis déjà en ECHEC"));

        Map<String, Object> body = Map.of(
                "motif", "ABSENT",
                "disposition", "A_REPRESENTER"
        );

        mockMvc.perform(post("/api/tournees/tournee-001/colis/colis-001/echec")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /echec retourne 401 si non authentifié")
    void postEchec_retourne_401_si_non_authentifie() throws Exception {
        Map<String, Object> body = Map.of(
                "motif", "ABSENT",
                "disposition", "A_REPRESENTER"
        );

        mockMvc.perform(post("/api/tournees/tournee-001/colis/colis-001/echec")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }
}
