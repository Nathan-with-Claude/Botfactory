package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.*;
import com.docapost.supervision.domain.repository.VueTourneeDetailRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Tests TDD — ConsulterDetailTourneeHandler (US-012)
 */
@ExtendWith(MockitoExtension.class)
class ConsulterDetailTourneeHandlerTest {

    @Mock
    private VueTourneeDetailRepository vueTourneeDetailRepository;

    private ConsulterDetailTourneeHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ConsulterDetailTourneeHandler(vueTourneeDetailRepository);
    }

    @Test
    @DisplayName("retourne le détail complet avec colis et incidents")
    void handle_retourne_detail_avec_colis_et_incidents() {
        VueTournee vueTournee = new VueTournee("t-001", "Pierre", 3, 5,
                StatutTourneeVue.EN_COURS, Instant.now());
        List<VueColis> colis = List.of(
                new VueColis("c-001", "12 rue de la Paix", "LIVRE", null, Instant.now().minusSeconds(100)),
                new VueColis("c-002", "5 av Victor Hugo", "ECHEC", "ABSENT", Instant.now().minusSeconds(50)),
                new VueColis("c-003", "27 bd Haussmann", "A_LIVRER", null, null)
        );
        List<IncidentVue> incidents = List.of(
                new IncidentVue("c-002", "5 av Victor Hugo", "ABSENT", Instant.now().minusSeconds(50), "Sonnette HS")
        );
        VueTourneeDetail detail = new VueTourneeDetail(vueTournee, colis, incidents);

        when(vueTourneeDetailRepository.findByTourneeId("t-001")).thenReturn(Optional.of(detail));

        VueTourneeDetail result = handler.handle(new ConsulterDetailTourneeQuery("t-001"));

        assertThat(result.vueTournee().getTourneeId()).isEqualTo("t-001");
        assertThat(result.colis()).hasSize(3);
        assertThat(result.incidents()).hasSize(1);
        assertThat(result.incidents().get(0).motif()).isEqualTo("ABSENT");
    }

    @Test
    @DisplayName("lève TourneeSupervisionNotFoundException si tournée introuvable")
    void handle_leve_exception_si_tournee_introuvable() {
        when(vueTourneeDetailRepository.findByTourneeId("t-inconnu")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(new ConsulterDetailTourneeQuery("t-inconnu")))
                .isInstanceOf(TourneeSupervisionNotFoundException.class)
                .hasMessageContaining("t-inconnu");
    }

    @Test
    @DisplayName("retourne un détail avec listes vides si aucun colis/incident")
    void handle_retourne_detail_avec_listes_vides() {
        VueTournee vueTournee = new VueTournee("t-002", "Marie", 0, 0,
                StatutTourneeVue.EN_COURS, Instant.now());
        VueTourneeDetail detail = new VueTourneeDetail(vueTournee, List.of(), List.of());

        when(vueTourneeDetailRepository.findByTourneeId("t-002")).thenReturn(Optional.of(detail));

        VueTourneeDetail result = handler.handle(new ConsulterDetailTourneeQuery("t-002"));

        assertThat(result.colis()).isEmpty();
        assertThat(result.incidents()).isEmpty();
    }
}
