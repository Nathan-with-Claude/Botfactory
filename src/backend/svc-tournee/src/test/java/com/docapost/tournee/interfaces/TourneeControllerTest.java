package com.docapost.tournee.interfaces;

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

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'integration de la couche interface REST — TourneeController
 * Utilise @WebMvcTest pour tester uniquement la couche HTTP.
 *
 * Note BUG-002 : spring.classformat.ignore=true est requis car Spring ASM 9.x
 * (inclus dans Spring Boot 3.4.x) ne supporte pas les class files Java 25+ (format 69).
 * Ce parametre permet d'ignorer les fichiers de classe incompatibles lors du scan.
 */
@WebMvcTest(TourneeController.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
class TourneeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ConsulterListeColisHandler consulterListeColisHandler;

    @MockBean
    private com.docapost.tournee.application.ConsulterDetailColisHandler consulterDetailColisHandler;

    @MockBean
    private com.docapost.tournee.application.DeclarerEchecLivraisonHandler declarerEchecLivraisonHandler;

    @MockBean
    private com.docapost.tournee.application.CloturerTourneeHandler cloturerTourneeHandler;

    @MockBean
    private com.docapost.tournee.application.ConfirmerLivraisonHandler confirmerLivraisonHandler;

    @Test
    @DisplayName("GET /api/tournees/today retourne 200 avec la liste des colis")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getTourneeToday_retourne_200_avec_colis() throws Exception {
        Tournee tournee = uneTourneeAvecDeuxColis();
        when(consulterListeColisHandler.handle(any())).thenReturn(tournee);

        mockMvc.perform(get("/api/tournees/today")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tourneeId").exists())
                .andExpect(jsonPath("$.colis").isArray())
                .andExpect(jsonPath("$.colis", hasSize(2)))
                .andExpect(jsonPath("$.resteALivrer").value(2))
                .andExpect(jsonPath("$.colisTotal").value(2));
    }

    @Test
    @DisplayName("GET /api/tournees/today retourne 200 avec adresse et destinataire sur chaque colis")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getTourneeToday_retourne_details_colis() throws Exception {
        Tournee tournee = uneTourneeAvecDeuxColis();
        when(consulterListeColisHandler.handle(any())).thenReturn(tournee);

        mockMvc.perform(get("/api/tournees/today"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.colis[0].adresseLivraison").exists())
                .andExpect(jsonPath("$.colis[0].destinataire").exists())
                .andExpect(jsonPath("$.colis[0].statut").value("A_LIVRER"));
    }

    @Test
    @DisplayName("GET /api/tournees/today retourne 404 si aucune tournee n'existe pour ce livreur")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getTourneeToday_retourne_404_si_pas_de_tournee() throws Exception {
        when(consulterListeColisHandler.handle(any()))
                .thenThrow(new TourneeNotFoundException("livreur-001", LocalDate.now()));

        mockMvc.perform(get("/api/tournees/today"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/tournees/today retourne 401 si non authentifie")
    void getTourneeToday_retourne_401_si_non_authentifie() throws Exception {
        mockMvc.perform(get("/api/tournees/today"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/tournees/today retourne les contraintes sur les colis")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getTourneeToday_retourne_contraintes() throws Exception {
        Tournee tournee = uneTourneeAvecContrainte();
        when(consulterListeColisHandler.handle(any())).thenReturn(tournee);

        mockMvc.perform(get("/api/tournees/today"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.colis[0].contraintes").isArray())
                .andExpect(jsonPath("$.colis[0].contraintes[0].type").value("HORAIRE"))
                .andExpect(jsonPath("$.colis[0].contraintes[0].valeur").value("Avant 14h00"));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private static final TourneeId TOURNEE_ID = new TourneeId("tournee-001");
    private static final LivreurId LIVREUR_ID = new LivreurId("livreur-001");

    private Tournee uneTourneeAvecDeuxColis() {
        return new Tournee(
                TOURNEE_ID, LIVREUR_ID, LocalDate.now(),
                List.of(
                        unColis("c-1", List.of()),
                        unColis("c-2", List.of())
                ),
                StatutTournee.DEMARREE
        );
    }

    private Tournee uneTourneeAvecContrainte() {
        Contrainte contrainte = new Contrainte(TypeContrainte.HORAIRE, "Avant 14h00");
        return new Tournee(
                TOURNEE_ID, LIVREUR_ID, LocalDate.now(),
                List.of(unColis("c-1", List.of(contrainte))),
                StatutTournee.DEMARREE
        );
    }

    private Colis unColis(String id, List<Contrainte> contraintes) {
        return new Colis(
                new ColisId(id),
                TOURNEE_ID,
                StatutColis.A_LIVRER,
                new Adresse("12 Rue du Port", null, "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                contraintes
        );
    }
}
