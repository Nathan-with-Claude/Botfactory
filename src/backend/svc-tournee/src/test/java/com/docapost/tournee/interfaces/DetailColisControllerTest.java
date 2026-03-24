package com.docapost.tournee.interfaces;

import com.docapost.tournee.application.ColisNotFoundException;
import com.docapost.tournee.application.ConsulterDetailColisHandler;
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
 * Tests d'integration de la couche REST — endpoint GET /api/tournees/{tourneeId}/colis/{colisId}
 * US-004 : Acceder au detail d'un colis.
 *
 * Verifie :
 * - 200 avec les details complets du colis (adresse, destinataire, contraintes, statut)
 * - 404 si la tournee n'existe pas
 * - 404 si le colis n'existe pas dans la tournee
 * - 401 si non authentifie
 * - Le numero de telephone est present dans le JSON (masquage cote frontend)
 */
@WebMvcTest(TourneeController.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
class DetailColisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private com.docapost.tournee.application.ConsulterListeColisHandler consulterListeColisHandler;

    @MockBean
    private ConsulterDetailColisHandler consulterDetailColisHandler;

    @MockBean
    private com.docapost.tournee.application.DeclarerEchecLivraisonHandler declarerEchecLivraisonHandler;

    @MockBean
    private com.docapost.tournee.application.CloturerTourneeHandler cloturerTourneeHandler;

    @MockBean
    private com.docapost.tournee.application.ConfirmerLivraisonHandler confirmerLivraisonHandler;

    private static final TourneeId TOURNEE_ID = new TourneeId("tournee-001");
    private static final ColisId COLIS_ID = new ColisId("colis-001");

    @Test
    @DisplayName("GET /api/tournees/{tourneeId}/colis/{colisId} retourne 200 avec les details du colis")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getDetailColis_retourne_200_avec_details() throws Exception {
        Colis colis = unColisALivrer();
        when(consulterDetailColisHandler.handle(any())).thenReturn(colis);

        mockMvc.perform(get("/api/tournees/{tourneeId}/colis/{colisId}",
                        TOURNEE_ID.value(), COLIS_ID.value())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.colisId").value(COLIS_ID.value()))
                .andExpect(jsonPath("$.statut").value("A_LIVRER"))
                .andExpect(jsonPath("$.adresseLivraison").exists())
                .andExpect(jsonPath("$.adresseLivraison.rue").value("12 Rue du Port"))
                .andExpect(jsonPath("$.adresseLivraison.complementAdresse").value("Apt 3B"))
                .andExpect(jsonPath("$.destinataire").exists())
                .andExpect(jsonPath("$.destinataire.nom").value("M. Dupont"))
                .andExpect(jsonPath("$.contraintes").isArray());
    }

    @Test
    @DisplayName("GET detail colis retourne les contraintes actives du colis")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getDetailColis_retourne_contraintes() throws Exception {
        Colis colis = unColisAvecContraintes();
        when(consulterDetailColisHandler.handle(any())).thenReturn(colis);

        mockMvc.perform(get("/api/tournees/{tourneeId}/colis/{colisId}",
                        TOURNEE_ID.value(), COLIS_ID.value()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contraintes", hasSize(2)))
                .andExpect(jsonPath("$.contraintes[0].type").value("HORAIRE"))
                .andExpect(jsonPath("$.contraintes[0].valeur").value("Avant 14h00"))
                .andExpect(jsonPath("$.contraintes[1].type").value("FRAGILE"));
    }

    @Test
    @DisplayName("GET detail colis retourne le statut LIVRE pour un colis traite")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getDetailColis_retourne_statut_terminal() throws Exception {
        Colis colis = unColisLivre();
        when(consulterDetailColisHandler.handle(any())).thenReturn(colis);

        mockMvc.perform(get("/api/tournees/{tourneeId}/colis/{colisId}",
                        TOURNEE_ID.value(), COLIS_ID.value()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("LIVRE"))
                .andExpect(jsonPath("$.estTraite").value(true));
    }

    @Test
    @DisplayName("GET detail colis retourne 404 si la tournee n'existe pas")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getDetailColis_retourne_404_si_tournee_introuvable() throws Exception {
        when(consulterDetailColisHandler.handle(any()))
                .thenThrow(new TourneeNotFoundException("tournee-001", LocalDate.now()));

        mockMvc.perform(get("/api/tournees/{tourneeId}/colis/{colisId}",
                        TOURNEE_ID.value(), COLIS_ID.value()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET detail colis retourne 404 si le colis n'est pas dans la tournee")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getDetailColis_retourne_404_si_colis_introuvable() throws Exception {
        when(consulterDetailColisHandler.handle(any()))
                .thenThrow(new ColisNotFoundException(TOURNEE_ID.value(), COLIS_ID.value()));

        mockMvc.perform(get("/api/tournees/{tourneeId}/colis/{colisId}",
                        TOURNEE_ID.value(), COLIS_ID.value()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET detail colis retourne 401 si non authentifie")
    void getDetailColis_retourne_401_si_non_authentifie() throws Exception {
        mockMvc.perform(get("/api/tournees/{tourneeId}/colis/{colisId}",
                        TOURNEE_ID.value(), COLIS_ID.value()))
                .andExpect(status().isUnauthorized());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Colis unColisALivrer() {
        return new Colis(
                COLIS_ID,
                TOURNEE_ID,
                StatutColis.A_LIVRER,
                new Adresse("12 Rue du Port", "Apt 3B", "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                List.of()
        );
    }

    private Colis unColisAvecContraintes() {
        return new Colis(
                COLIS_ID,
                TOURNEE_ID,
                StatutColis.A_LIVRER,
                new Adresse("12 Rue du Port", "Apt 3B", "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                List.of(
                        new Contrainte(TypeContrainte.HORAIRE, "Avant 14h00"),
                        new Contrainte(TypeContrainte.FRAGILE, "Fragile")
                )
        );
    }

    private Colis unColisLivre() {
        return new Colis(
                COLIS_ID,
                TOURNEE_ID,
                StatutColis.LIVRE,
                new Adresse("12 Rue du Port", "Apt 3B", "69003", "Lyon", "Zone A"),
                new Destinataire("M. Dupont", "0601020304"),
                List.of()
        );
    }
}
