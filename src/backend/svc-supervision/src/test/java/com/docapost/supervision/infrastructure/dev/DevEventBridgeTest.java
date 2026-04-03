package com.docapost.supervision.infrastructure.dev;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.infrastructure.persistence.VueColisJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour DevEventBridge (US-033)
 *
 * Scenarios couverts :
 * - SC2 : propaguerTourneeLancee cree une VueTournee dans BC-03
 * - SC3 : propaguerTourneeLancee appelle svc-tournee via HTTP
 * - SC4/SC6 : echec HTTP vers svc-tournee est loggue sans propager l'exception
 * - SC6 : idempotence — pas de creation de VueTournee si elle existe deja
 */
@ExtendWith(MockitoExtension.class)
class DevEventBridgeTest {

    @Mock
    private VueTourneeRepository vueTourneeRepository;

    @Mock
    private VueColisJpaRepository vueColisJpaRepository;

    @Mock
    private RestTemplate restTemplate;

    private DevEventBridge devEventBridge;

    @BeforeEach
    void setUp() {
        devEventBridge = new DevEventBridge(vueTourneeRepository, vueColisJpaRepository, restTemplate, "http://localhost:8081");
    }

    // ─── SC2 : Création VueTournee dans BC-03 ──────────────────────────────────

    @Test
    @DisplayName("propaguerTourneeLancee cree une VueTournee EN_COURS dans BC-03")
    void propaguerTourneeLancee_cree_vueTournee_en_cours() {
        // Given
        TourneeLancee event = new TourneeLancee(
                "tp-test-001", "T-2026-0042", "livreur-007", "Jean Dupont",
                "superviseur-001", Instant.now(), 5
        );
        when(vueTourneeRepository.findByTourneeId("T-2026-0042")).thenReturn(Optional.empty());
        when(vueTourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn("created");

        // When
        devEventBridge.propaguerTourneeLancee(event);

        // Then
        ArgumentCaptor<VueTournee> captor = ArgumentCaptor.forClass(VueTournee.class);
        verify(vueTourneeRepository).save(captor.capture());
        VueTournee vueCree = captor.getValue();
        assertThat(vueCree.getTourneeId()).isEqualTo("T-2026-0042");
        assertThat(vueCree.getLivreurNom()).isEqualTo("Jean Dupont");
        assertThat(vueCree.getStatut()).isEqualTo(StatutTourneeVue.EN_COURS);
        assertThat(vueCree.getColisTraites()).isEqualTo(0);
        assertThat(vueCree.getColisTotal()).isEqualTo(5);
    }

    // ─── SC3 : Appel HTTP vers svc-tournee ────────────────────────────────────

    @Test
    @DisplayName("propaguerTourneeLancee appelle svc-tournee POST /internal/dev/tournees")
    void propaguerTourneeLancee_appelle_svc_tournee() {
        // Given
        TourneeLancee event = new TourneeLancee(
                "tp-test-002", "T-2026-0043", "livreur-008", "Marie Martin",
                "superviseur-001", Instant.now(), 4
        );
        when(vueTourneeRepository.findByTourneeId(any())).thenReturn(Optional.empty());
        when(vueTourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn("created");

        // When
        devEventBridge.propaguerTourneeLancee(event);

        // Then
        verify(restTemplate).postForObject(
                eq("http://localhost:8081/internal/dev/tournees"),
                any(),
                eq(String.class)
        );
    }

    // ─── Resilience : echec HTTP ne casse pas le lancement ───────────────────

    @Test
    @DisplayName("propaguerTourneeLancee continue si svc-tournee est indisponible")
    void propaguerTourneeLancee_continue_si_svc_tournee_down() {
        // Given
        TourneeLancee event = new TourneeLancee(
                "tp-test-003", "T-2026-0044", "livreur-009", "Paul Leroy",
                "superviseur-001", Instant.now(), 3
        );
        when(vueTourneeRepository.findByTourneeId(any())).thenReturn(Optional.empty());
        when(vueTourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForObject(anyString(), any(), eq(String.class)))
                .thenThrow(new RestClientException("Connection refused"));

        // When — ne doit pas lever d'exception
        devEventBridge.propaguerTourneeLancee(event);

        // Then — la VueTournee est quand meme cree en BC-03
        verify(vueTourneeRepository).save(any(VueTournee.class));
    }

    // ─── SC6 : Idempotence VueTournee ─────────────────────────────────────────

    @Test
    @DisplayName("propaguerTourneeLancee ne recrée pas une VueTournee deja existante")
    void propaguerTourneeLancee_idempotent_vueTournee() {
        // Given — la VueTournee existe deja
        TourneeLancee event = new TourneeLancee(
                "tp-test-004", "T-2026-0042", "livreur-007", "Jean Dupont",
                "superviseur-001", Instant.now(), 5
        );
        VueTournee existante = new VueTournee(
                "T-2026-0042", "Jean Dupont", 0, 5,
                StatutTourneeVue.EN_COURS, Instant.now()
        );
        when(vueTourneeRepository.findByTourneeId("T-2026-0042")).thenReturn(Optional.of(existante));
        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn("created");

        // When
        devEventBridge.propaguerTourneeLancee(event);

        // Then — save n'est pas appele (tournee deja presente)
        verify(vueTourneeRepository, never()).save(any());
    }
}
