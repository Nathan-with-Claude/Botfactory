package com.docapost.tournee.interfaces;

import com.docapost.tournee.application.*;
import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.model.TourneeInvariantException;
import com.docapost.tournee.domain.preuves.model.*;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests d'intégration — Controller REST : ConfirmerLivraison (US-008 + US-009)
 *
 * Vérifie les codes HTTP et la structure de la réponse.
 * Le handler est mocké via @MockBean.
 * Utilise @WebMvcTest cohérent avec les autres tests Controller.
 */
@WebMvcTest(TourneeController.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
class ConfirmerLivraisonControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConsulterListeColisHandler consulterListeColisHandler;

    @MockBean
    private ConsulterDetailColisHandler consulterDetailColisHandler;

    @MockBean
    private DeclarerEchecLivraisonHandler declarerEchecLivraisonHandler;

    @MockBean
    private CloturerTourneeHandler cloturerTourneeHandler;

    @MockBean
    private ConfirmerLivraisonHandler confirmerLivraisonHandler;

    @MockBean
    private com.docapost.tournee.infrastructure.supervision.SupervisionNotifier supervisionNotifier;

    private static final String TOURNEE_ID = "tournee-dev-001";
    private static final String COLIS_ID = "colis-001";

    // ─── US-008 : Signature ───────────────────────────────────────────────────

    @Test
    @DisplayName("POST /livraison avec SIGNATURE retourne 200 et PreuveLivraisonDTO")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postLivraison_signature_retourne_200() throws Exception {
        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                new ColisId(COLIS_ID),
                new TourneeId(TOURNEE_ID),
                "sig_base64".getBytes(),
                new Coordonnees(45.7, 4.8)
        );
        when(confirmerLivraisonHandler.handle(any())).thenReturn(preuve);

        mockMvc.perform(post("/api/tournees/{tourneeId}/colis/{colisId}/livraison", TOURNEE_ID, COLIS_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "typePreuve": "SIGNATURE",
                                    "donneesSignature": "sig_base64",
                                    "coordonneesGps": {"latitude": 45.7, "longitude": 4.8}
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preuveLivraisonId").isNotEmpty())
                .andExpect(jsonPath("$.colisId").value(COLIS_ID))
                .andExpect(jsonPath("$.typePreuve").value("SIGNATURE"))
                .andExpect(jsonPath("$.modeDegradeGps").value(false));
    }

    @Test
    @DisplayName("POST /livraison avec SIGNATURE sans GPS retourne 200 et modeDegradeGps=true")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postLivraison_signature_sans_gps_retourne_200_mode_degrade() throws Exception {
        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                new ColisId(COLIS_ID), new TourneeId(TOURNEE_ID),
                "sig".getBytes(), null
        );
        when(confirmerLivraisonHandler.handle(any())).thenReturn(preuve);

        mockMvc.perform(post("/api/tournees/{tourneeId}/colis/{colisId}/livraison", TOURNEE_ID, COLIS_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "typePreuve": "SIGNATURE", "donneesSignature": "sig" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modeDegradeGps").value(true));
    }

    // ─── US-009 : Photo ──────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /livraison avec PHOTO retourne 200 et typePreuve=PHOTO")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postLivraison_photo_retourne_200() throws Exception {
        PreuveLivraison preuve = PreuveLivraison.capturePhoto(
                new ColisId(COLIS_ID), new TourneeId(TOURNEE_ID),
                "photos/colis-001.jpg", "sha256:abc",
                new Coordonnees(45.7, 4.8)
        );
        when(confirmerLivraisonHandler.handle(any())).thenReturn(preuve);

        mockMvc.perform(post("/api/tournees/{tourneeId}/colis/{colisId}/livraison", TOURNEE_ID, COLIS_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "typePreuve": "PHOTO",
                                    "urlPhoto": "photos/colis-001.jpg",
                                    "hashIntegrite": "sha256:abc",
                                    "coordonneesGps": {"latitude": 45.7, "longitude": 4.8}
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.typePreuve").value("PHOTO"));
    }

    // ─── US-009 : Tiers ──────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /livraison avec TIERS_IDENTIFIE retourne 200")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postLivraison_tiers_retourne_200() throws Exception {
        PreuveLivraison preuve = PreuveLivraison.captureTiers(
                new ColisId(COLIS_ID), new TourneeId(TOURNEE_ID),
                "Mme Leroy", new Coordonnees(45.7, 4.8)
        );
        when(confirmerLivraisonHandler.handle(any())).thenReturn(preuve);

        mockMvc.perform(post("/api/tournees/{tourneeId}/colis/{colisId}/livraison", TOURNEE_ID, COLIS_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "typePreuve": "TIERS_IDENTIFIE",
                                    "nomTiers": "Mme Leroy",
                                    "coordonneesGps": {"latitude": 45.7, "longitude": 4.8}
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.typePreuve").value("TIERS_IDENTIFIE"));
    }

    // ─── Cas d'erreur ────────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /livraison retourne 404 si tournee introuvable")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postLivraison_retourne_404_si_tournee_introuvable() throws Exception {
        when(confirmerLivraisonHandler.handle(any()))
                .thenThrow(new TourneeNotFoundException("tournee-xxx", java.time.LocalDate.now()));

        mockMvc.perform(post("/api/tournees/{tourneeId}/colis/{colisId}/livraison", TOURNEE_ID, COLIS_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "typePreuve": "SIGNATURE", "donneesSignature": "sig" }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /livraison retourne 409 si colis deja livre")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postLivraison_retourne_409_si_colis_deja_livre() throws Exception {
        when(confirmerLivraisonHandler.handle(any()))
                .thenThrow(new TourneeInvariantException("Transition interdite"));

        mockMvc.perform(post("/api/tournees/{tourneeId}/colis/{colisId}/livraison", TOURNEE_ID, COLIS_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "typePreuve": "SIGNATURE", "donneesSignature": "sig" }
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("POST /livraison retourne 400 si donnees de signature vides")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postLivraison_retourne_400_si_signature_invalide() throws Exception {
        when(confirmerLivraisonHandler.handle(any()))
                .thenThrow(new PreuveLivraisonInvariantException("Signature vide"));

        mockMvc.perform(post("/api/tournees/{tourneeId}/colis/{colisId}/livraison", TOURNEE_ID, COLIS_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "typePreuve": "SIGNATURE", "donneesSignature": "" }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /livraison retourne 400 si typePreuve inconnu")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void postLivraison_retourne_400_si_type_preuve_inconnu() throws Exception {
        mockMvc.perform(post("/api/tournees/{tourneeId}/colis/{colisId}/livraison", TOURNEE_ID, COLIS_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "typePreuve": "INCONNU", "donneesSignature": "sig" }
                                """))
                .andExpect(status().isBadRequest());
    }
}
