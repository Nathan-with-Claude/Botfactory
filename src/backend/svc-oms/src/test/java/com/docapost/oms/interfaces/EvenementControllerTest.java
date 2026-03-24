package com.docapost.oms.interfaces;

import com.docapost.oms.application.*;
import com.docapost.oms.domain.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.docapost.oms.interfaces.rest.EvenementController;
import com.docapost.oms.interfaces.security.SecurityConfig;
import org.springframework.context.annotation.Import;

/**
 * Tests @WebMvcTest — EvenementController (US-017 + US-018).
 */
@WebMvcTest(EvenementController.class)
@Import(SecurityConfig.class)
class EvenementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EnregistrerEvenementHandler enregistrerHandler;

    @MockBean
    private ConsulterHistoriqueColisHandler historiqueColisHandler;

    @MockBean
    private ConsulterHistoriqueTourneeHandler historiqueTourneeHandler;

    private static final Instant NOW = Instant.parse("2026-03-24T09:00:00Z");

    private Map<String, Object> buildRequest(String eventId) {
        return Map.of(
                "eventId", eventId,
                "tourneeId", "tournee-001",
                "colisId", "colis-001",
                "livreurId", "livreur-001",
                "type", "LIVRAISON_CONFIRMEE",
                "horodatage", NOW.toString(),
                "latitude", 48.8566,
                "longitude", 2.3522
        );
    }

    // ─── POST /api/oms/evenements ─────────────────────────────────────────────

    @Test
    @WithMockUser(roles = {"SYSTEME"})
    void devrait_retourner_201_lors_enregistrement_evenement() throws Exception {
        doNothing().when(enregistrerHandler).handle(any());

        mockMvc.perform(post("/api/oms/evenements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest("evt-001"))))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = {"SYSTEME"})
    void devrait_retourner_409_si_eventId_deja_existant() throws Exception {
        doThrow(new EvenementDejaExistantException("evt-dupliquer"))
                .when(enregistrerHandler).handle(any());

        mockMvc.perform(post("/api/oms/evenements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRequest("evt-dupliquer"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.erreur").value(org.hamcrest.Matchers.containsString("evt-dupliquer")));
    }

    // ─── GET /api/oms/evenements/colis/{colisId} ─────────────────────────────

    @Test
    @WithMockUser(roles = {"SUPERVISEUR"})
    void devrait_retourner_historique_colis_en_ordre_chronologique() throws Exception {
        EvenementLivraison ev1 = new EvenementLivraison(
                "evt-001", "tournee-001", "colis-001", "livreur-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, NOW,
                new Coordonnees(48.8566, 2.3522), false, "preuve-001", null,
                StatutSynchronisation.SYNCHRONIZED, 1
        );
        when(historiqueColisHandler.handle(any())).thenReturn(List.of(ev1));

        mockMvc.perform(get("/api/oms/evenements/colis/colis-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value("evt-001"))
                .andExpect(jsonPath("$[0].livreurId").value("livreur-001"))
                .andExpect(jsonPath("$[0].type").value("LIVRAISON_CONFIRMEE"))
                .andExpect(jsonPath("$[0].statutSynchronisation").value("SYNCHRONIZED"))
                .andExpect(jsonPath("$[0].modeDegradGPS").value(false));
    }

    @Test
    @WithMockUser(roles = {"SUPERVISEUR"})
    void devrait_retourner_liste_vide_si_colis_sans_historique() throws Exception {
        when(historiqueColisHandler.handle(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/oms/evenements/colis/colis-inconnu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    // ─── GET /api/oms/evenements/tournee/{tourneeId} ──────────────────────────

    @Test
    @WithMockUser(roles = {"SUPERVISEUR"})
    void devrait_retourner_historique_tournee() throws Exception {
        EvenementLivraison ev = new EvenementLivraison(
                "evt-100", "tournee-001", null, "livreur-001",
                TypeEvenement.TOURNEE_DEMARREE, NOW,
                new Coordonnees(48.8, 2.3), false, null, null,
                StatutSynchronisation.SYNCHRONIZED, 1
        );
        when(historiqueTourneeHandler.handle(any())).thenReturn(List.of(ev));

        mockMvc.perform(get("/api/oms/evenements/tournee/tournee-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value("evt-100"))
                .andExpect(jsonPath("$[0].type").value("TOURNEE_DEMARREE"));
    }

    @Test
    @WithMockUser(roles = {"SUPERVISEUR"})
    void devrait_retourner_evenement_mode_degrade_gps_sans_coordonnees() throws Exception {
        EvenementLivraison ev = new EvenementLivraison(
                "evt-gps", "tournee-001", "colis-002", "livreur-001",
                TypeEvenement.ECHEC_LIVRAISON_DECLARE, NOW,
                null, true, null, "ABSENT",
                StatutSynchronisation.PENDING, 0
        );
        when(historiqueColisHandler.handle(any())).thenReturn(List.of(ev));

        mockMvc.perform(get("/api/oms/evenements/colis/colis-002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].modeDegradGPS").value(true))
                .andExpect(jsonPath("$[0].latitude").doesNotExist())
                .andExpect(jsonPath("$[0].longitude").doesNotExist())
                .andExpect(jsonPath("$[0].motifEchec").value("ABSENT"));
    }
}
