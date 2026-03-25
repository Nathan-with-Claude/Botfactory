package com.docapost.tournee.interfaces;

import com.docapost.tournee.application.ConsulterPreuveLivraisonHandler;
import com.docapost.tournee.application.PreuveNotFoundException;
import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.preuves.model.Coordonnees;
import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.docapost.tournee.interfaces.rest.PreuveController;
import com.docapost.tournee.interfaces.security.SecurityConfig;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests @WebMvcTest — PreuveController (US-010)
 *
 * Vérifie :
 * 1. GET /api/preuves/livraison/{colisId} retourne 200 avec les métadonnées (SUPERVISEUR)
 * 2. GET /api/preuves/livraison/{colisId} retourne 404 si preuve absente
 * 3. GET /api/preuves/livraison/{colisId} retourne 403 si rôle LIVREUR
 */
@WebMvcTest(PreuveController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "spring.classformat.ignore=true")
class PreuveControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConsulterPreuveLivraisonHandler consulterPreuveLivraisonHandler;

    @Test
    @DisplayName("GET /api/preuves/livraison/{colisId} retourne 200 avec PreuveLivraisonDTO (SUPERVISEUR)")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getPreuveLivraison_retourne_200_pour_superviseur() throws Exception {
        ColisId colisId = new ColisId("colis-001");
        TourneeId tourneeId = new TourneeId("tournee-001");
        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                colisId, tourneeId, "signature".getBytes(),
                new Coordonnees(48.85, 2.35)
        );
        preuve.pullDomainEvents();

        when(consulterPreuveLivraisonHandler.handle(any())).thenReturn(preuve);

        mockMvc.perform(get("/api/preuves/livraison/colis-001")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.colisId").value("colis-001"))
                .andExpect(jsonPath("$.typePreuve").value("SIGNATURE"))
                .andExpect(jsonPath("$.horodatage").exists())
                .andExpect(jsonPath("$.livreurId").doesNotExist())
                .andExpect(jsonPath("$.coordonneesGps").exists())
                .andExpect(jsonPath("$.modeDegradeGps").value(false));
    }

    @Test
    @DisplayName("GET /api/preuves/livraison/{colisId} retourne 200 avec coordonnées GPS (SUPPORT)")
    @WithMockUser(username = "support-001", roles = "SUPPORT")
    void getPreuveLivraison_retourne_200_pour_support() throws Exception {
        ColisId colisId = new ColisId("colis-002");
        TourneeId tourneeId = new TourneeId("tournee-001");
        PreuveLivraison preuve = PreuveLivraison.capturePhoto(
                colisId, tourneeId, "https://s3/photo.jpg", "sha256", null
        );
        preuve.pullDomainEvents();

        when(consulterPreuveLivraisonHandler.handle(any())).thenReturn(preuve);

        mockMvc.perform(get("/api/preuves/livraison/colis-002")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.typePreuve").value("PHOTO"))
                .andExpect(jsonPath("$.modeDegradeGps").value(true));
    }

    @Test
    @DisplayName("GET /api/preuves/livraison/{colisId} retourne 404 si preuve absente")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void getPreuveLivraison_retourne_404_si_preuve_absente() throws Exception {
        when(consulterPreuveLivraisonHandler.handle(any()))
                .thenThrow(new PreuveNotFoundException("colis-inconnu"));

        mockMvc.perform(get("/api/preuves/livraison/colis-inconnu")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/preuves/livraison/{colisId} retourne 403 si rôle LIVREUR")
    @WithMockUser(username = "livreur-001", roles = "LIVREUR")
    void getPreuveLivraison_retourne_403_pour_livreur() throws Exception {
        mockMvc.perform(get("/api/preuves/livraison/colis-001")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
