package com.docapost.tournee.interfaces.dev;

import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.repository.TourneeRepository;
import com.docapost.tournee.interfaces.security.SecurityConfig;
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

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests @WebMvcTest — DevTourneeController (US-033)
 *
 * Scenarios couverts :
 * - SC3 : POST /internal/dev/tournees cree une Tournee dans svc-tournee
 * - SC6 : idempotence — retourne 200 si la tournee existe deja
 * - SC3 : les colis generes ont le bon statut A_LIVRER
 */
@WebMvcTest(DevTourneeController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("dev")
@TestPropertySource(properties = "spring.classformat.ignore=true")
class DevTourneeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TourneeRepository tourneeRepository;

    // ─── SC3 : Creation Tournee dans BC-01 ────────────────────────────────────

    @Test
    @DisplayName("POST /internal/dev/tournees cree une Tournee avec les colis generes")
    @WithMockUser(username = "livreur-007", roles = "LIVREUR")
    void creerTourneeDevTms_cree_tournee_avec_colis() throws Exception {
        // Given
        ArgumentCaptor<Tournee> captor = ArgumentCaptor.forClass(Tournee.class);
        when(tourneeRepository.findById(any(TourneeId.class))).thenReturn(Optional.empty());
        when(tourneeRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        // When
        mockMvc.perform(post("/internal/dev/tournees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "tourneeId": "T-2026-0042",
                                "livreurId": "livreur-007",
                                "livreurNom": "Jean Dupont",
                                "nbColis": 5
                            }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tourneeId").value("T-2026-0042"));

        // Then
        Tournee tournee = captor.getValue();
        assertThat(tournee.getId().value()).isEqualTo("T-2026-0042");
        assertThat(tournee.getLivreurId().value()).isEqualTo("livreur-007");
        assertThat(tournee.getColis()).hasSize(5);
    }

    @Test
    @DisplayName("POST /internal/dev/tournees avec nbColis valide genere des colis A_LIVRER")
    @WithMockUser(username = "livreur-007", roles = "LIVREUR")
    void creerTourneeDevTms_colis_sont_a_livrer() throws Exception {
        // Given
        ArgumentCaptor<Tournee> captor = ArgumentCaptor.forClass(Tournee.class);
        when(tourneeRepository.findById(any(TourneeId.class))).thenReturn(Optional.empty());
        when(tourneeRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

        // When
        mockMvc.perform(post("/internal/dev/tournees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "tourneeId": "T-2026-0043",
                                "livreurId": "livreur-008",
                                "livreurNom": "Marie Martin",
                                "nbColis": 3
                            }
                        """))
                .andExpect(status().isCreated());

        // Then — tous les colis sont A_LIVRER
        Tournee tournee = captor.getValue();
        tournee.getColis().forEach(c ->
                assertThat(c.getStatut().name()).isEqualTo("A_LIVRER")
        );
    }

    // ─── SC6 : Idempotence ────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /internal/dev/tournees est idempotent si la tournee existe deja")
    @WithMockUser(username = "livreur-007", roles = "LIVREUR")
    void creerTourneeDevTms_idempotent_si_deja_existante() throws Exception {
        // Given — la tournee existe deja
        when(tourneeRepository.findById(new TourneeId("T-2026-0042")))
                .thenReturn(Optional.of(mock(Tournee.class)));

        // When
        mockMvc.perform(post("/internal/dev/tournees")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                                "tourneeId": "T-2026-0042",
                                "livreurId": "livreur-007",
                                "livreurNom": "Jean Dupont",
                                "nbColis": 5
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tourneeId").value("T-2026-0042"));

        // Then — aucune creation
        verify(tourneeRepository, never()).save(any());
    }
}
