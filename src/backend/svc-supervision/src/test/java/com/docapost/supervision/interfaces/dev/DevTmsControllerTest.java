package com.docapost.supervision.interfaces.dev;

import com.docapost.supervision.domain.planification.model.TourneePlanifiee;
import com.docapost.supervision.domain.planification.repository.TourneePlanifieeRepository;
import com.docapost.supervision.infrastructure.seeder.DevDataSeeder;
import com.docapost.supervision.interfaces.security.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests @WebMvcTest — DevTmsController (US-033)
 *
 * Scenarios couverts :
 * - SC1 : POST /dev/tms/import cree N TourneesPlanifiees
 * - SC1 : chaque TourneePlanifiee contient entre 3 et 8 colis
 * - DELETE /dev/tms/reset vide les donnees
 */
@WebMvcTest(DevTmsController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("dev")
@TestPropertySource(properties = "spring.classformat.ignore=true")
class DevTmsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TourneePlanifieeRepository tourneePlanifieeRepository;

    @MockBean
    private DevDataSeeder devDataSeeder;

    @MockBean
    @org.springframework.beans.factory.annotation.Qualifier("devRestTemplate")
    private org.springframework.web.client.RestTemplate devRestTemplate;

    // ─── SC1 : Import simulé ──────────────────────────────────────────────────

    @Test
    @DisplayName("POST /dev/tms/import avec nombre=3 cree 3 TourneesPlanifiees")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void importTms_cree_n_tournees_planifiees() throws Exception {
        // Given
        doNothing().when(tourneePlanifieeRepository).save(any());

        // When
        mockMvc.perform(post("/dev/tms/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "nombre": 3,
                                "date": "2026-03-27"
                            }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tourneesCreees").value(3));

        // Then — 3 appels à save
        verify(tourneePlanifieeRepository, times(3)).save(any(TourneePlanifiee.class));
    }

    @Test
    @DisplayName("POST /dev/tms/import cree des tournees avec entre 3 et 8 colis")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void importTms_cree_tournees_avec_colis_realistes() throws Exception {
        // Given
        ArgumentCaptor<TourneePlanifiee> captor = ArgumentCaptor.forClass(TourneePlanifiee.class);
        doNothing().when(tourneePlanifieeRepository).save(captor.capture());

        // When
        mockMvc.perform(post("/dev/tms/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "nombre": 2,
                                "date": "2026-03-27"
                            }
                        """))
                .andExpect(status().isCreated());

        // Then — chaque tournée a entre 3 et 8 colis
        List<TourneePlanifiee> tournees = captor.getAllValues();
        assertThat(tournees).hasSize(2);
        tournees.forEach(t -> {
            assertThat(t.getNbColis()).isBetween(3, 8);
            assertThat(t.getId()).isNotBlank();
            assertThat(t.getCodeTms()).isNotBlank();
        });
    }

    @Test
    @DisplayName("POST /dev/tms/import avec nombre=0 retourne 400")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void importTms_refuse_nombre_zero() throws Exception {
        mockMvc.perform(post("/dev/tms/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "nombre": 0,
                                "date": "2026-03-27"
                            }
                        """))
                .andExpect(status().isBadRequest());
    }

    // ─── DELETE reset ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /dev/tms/reset supprime toutes les donnees dev")
    @WithMockUser(username = "superviseur-001", roles = "SUPERVISEUR")
    void resetTms_supprime_toutes_les_donnees() throws Exception {
        // When
        mockMvc.perform(delete("/dev/tms/reset"))
                .andExpect(status().isNoContent());

        // Then
        verify(devDataSeeder).reinitialiser();
    }
}
