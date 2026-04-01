package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.infrastructure.persistence.ProcessedEventJpaRepository;
import com.docapost.supervision.infrastructure.persistence.VueColisEntity;
import com.docapost.supervision.infrastructure.persistence.VueColisJpaRepository;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires TDD — VueTourneeEventHandler (US-032)
 *
 * Couvre :
 * - SC1 : ColisLivre incremente colisTraites et broadcaster appele
 * - SC2 : EchecDeclaree incremente colisTraites (echec = traite)
 * - SC3 : TourneeCloturee passe le statut a CLOTUREE
 * - SC4 : Idempotence - eventId deja traite -> pas de modification
 * - SC5 : Creation automatique d'une VueTournee si absente du read model
 */
class VueTourneeEventHandlerTest {

    private VueTourneeRepository vueTourneeRepository;
    private VueColisJpaRepository vueColisJpaRepository;
    private ProcessedEventJpaRepository processedEventJpaRepository;
    private TableauDeBordBroadcaster broadcaster;
    private VueTourneeEventHandler handler;

    @BeforeEach
    void setUp() {
        vueTourneeRepository = mock(VueTourneeRepository.class);
        vueColisJpaRepository = mock(VueColisJpaRepository.class);
        processedEventJpaRepository = mock(ProcessedEventJpaRepository.class);
        broadcaster = mock(TableauDeBordBroadcaster.class);
        handler = new VueTourneeEventHandler(
                vueTourneeRepository,
                vueColisJpaRepository,
                processedEventJpaRepository,
                broadcaster
        );
    }

    // ─── SC1 : COLIS_LIVRE ─────────────────────────────────────────────────────

    @Test
    @DisplayName("SC1 - COLIS_LIVRE incremente colisTraites, met a jour VueColis LIVRE et broadcaster appele")
    void colisLivre_incremente_colisTraites_et_broadcast() {
        // Given
        VueTournee vueTournee = new VueTournee("T-001", "Pierre Dupont", 1, 10,
                StatutTourneeVue.EN_COURS, Instant.now());
        VueColisEntity vueColis = new VueColisEntity("T-001", "C-009", "12 rue de la Paix", "A_LIVRER", null, null);
        when(processedEventJpaRepository.existsById("EVT-001")).thenReturn(false);
        when(vueTourneeRepository.findByTourneeId("T-001")).thenReturn(Optional.of(vueTournee));
        when(vueTourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(vueColisJpaRepository.findByTourneeIdAndColisId("T-001", "C-009")).thenReturn(Optional.of(vueColis));
        when(vueColisJpaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EvenementTourneeCommand command = new EvenementTourneeCommand(
                "EVT-001", "COLIS_LIVRE", "T-001", "livreur-001", "C-009", null,
                Instant.now().toString()
        );

        // When
        handler.handle(command);

        // Then — colisTraites incremente
        ArgumentCaptor<VueTournee> captorTournee = ArgumentCaptor.forClass(VueTournee.class);
        verify(vueTourneeRepository).save(captorTournee.capture());
        assertThat(captorTournee.getValue().getColisTraites()).isEqualTo(2);
        // Then — VueColis passe a LIVRE
        ArgumentCaptor<VueColisEntity> captorColis = ArgumentCaptor.forClass(VueColisEntity.class);
        verify(vueColisJpaRepository).save(captorColis.capture());
        assertThat(captorColis.getValue().getStatut()).isEqualTo("LIVRE");
        verify(broadcaster).broadcastTableauDeBord();
        verify(processedEventJpaRepository).save(any());
    }

    // ─── SC2 : ECHEC_DECLAREE ─────────────────────────────────────────────────

    @Test
    @DisplayName("SC2 - ECHEC_DECLAREE incremente colisTraites et met a jour VueColis ECHEC avec motif")
    void echecDeclaree_incremente_colisTraites_et_met_a_jour_colis() {
        // Given
        VueTournee vueTournee = new VueTournee("T-001", "Pierre Dupont", 1, 10,
                StatutTourneeVue.EN_COURS, Instant.now());
        VueColisEntity vueColis = new VueColisEntity("T-001", "C-003", "5 avenue Victor Hugo", "A_LIVRER", null, null);
        when(processedEventJpaRepository.existsById("EVT-002")).thenReturn(false);
        when(vueTourneeRepository.findByTourneeId("T-001")).thenReturn(Optional.of(vueTournee));
        when(vueTourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(vueColisJpaRepository.findByTourneeIdAndColisId("T-001", "C-003")).thenReturn(Optional.of(vueColis));
        when(vueColisJpaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EvenementTourneeCommand command = new EvenementTourneeCommand(
                "EVT-002", "ECHEC_DECLAREE", "T-001", "livreur-001", "C-003", "ABSENT",
                Instant.now().toString()
        );

        // When
        handler.handle(command);

        // Then — colisTraites incremente
        ArgumentCaptor<VueTournee> captorTournee = ArgumentCaptor.forClass(VueTournee.class);
        verify(vueTourneeRepository).save(captorTournee.capture());
        assertThat(captorTournee.getValue().getColisTraites()).isEqualTo(2);
        // Then — VueColis passe a ECHEC avec motif
        ArgumentCaptor<VueColisEntity> captorColis = ArgumentCaptor.forClass(VueColisEntity.class);
        verify(vueColisJpaRepository).save(captorColis.capture());
        assertThat(captorColis.getValue().getStatut()).isEqualTo("ECHEC");
        assertThat(captorColis.getValue().getMotifEchec()).isEqualTo("ABSENT");
        verify(broadcaster).broadcastTableauDeBord();
    }

    // ─── SC3 : TOURNEE_CLOTUREE ───────────────────────────────────────────────

    @Test
    @DisplayName("SC3 - TOURNEE_CLOTUREE passe le statut a CLOTUREE")
    void tourneeCloturee_passe_statut_cloturee() {
        // Given
        VueTournee vueTournee = new VueTournee("T-001", "Pierre Dupont", 10, 10,
                StatutTourneeVue.EN_COURS, Instant.now());
        when(processedEventJpaRepository.existsById("EVT-003")).thenReturn(false);
        when(vueTourneeRepository.findByTourneeId("T-001")).thenReturn(Optional.of(vueTournee));
        when(vueTourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EvenementTourneeCommand command = new EvenementTourneeCommand(
                "EVT-003", "TOURNEE_CLOTUREE", "T-001", "livreur-001", null, null,
                Instant.now().toString()
        );

        // When
        handler.handle(command);

        // Then
        ArgumentCaptor<VueTournee> captor = ArgumentCaptor.forClass(VueTournee.class);
        verify(vueTourneeRepository).save(captor.capture());
        assertThat(captor.getValue().getStatut()).isEqualTo(StatutTourneeVue.CLOTUREE);
        verify(broadcaster).broadcastTableauDeBord();
    }

    // ─── SC4 : Idempotence ─────────────────────────────────────────────────────

    @Test
    @DisplayName("SC4 - Idempotence : eventId deja traite -> aucune modification du read model")
    void idempotence_eventId_deja_traite_rien_ne_change() {
        // Given - l'event est deja en base
        when(processedEventJpaRepository.existsById("EVT-42")).thenReturn(true);

        EvenementTourneeCommand command = new EvenementTourneeCommand(
                "EVT-42", "COLIS_LIVRE", "T-001", "livreur-001", "C-009", null,
                Instant.now().toString()
        );

        // When
        handler.handle(command);

        // Then - aucune mise a jour
        verify(vueTourneeRepository, never()).save(any());
        verify(vueTourneeRepository, never()).findByTourneeId(anyString());
        verify(broadcaster, never()).broadcastTableauDeBord();
    }

    // ─── SC5 : Creation automatique VueTournee absente ─────────────────────────

    @Test
    @DisplayName("SC5 - Creation automatique VueTournee si absente du read model")
    void colisLivre_cree_vueTournee_si_absente() {
        // Given - la tournee n'existe pas encore dans le read model
        when(processedEventJpaRepository.existsById("EVT-010")).thenReturn(false);
        when(vueTourneeRepository.findByTourneeId("T-NOUVEAU")).thenReturn(Optional.empty());
        when(vueTourneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EvenementTourneeCommand command = new EvenementTourneeCommand(
                "EVT-010", "COLIS_LIVRE", "T-NOUVEAU", "livreur-999", "C-001", null,
                Instant.now().toString()
        );

        // When
        handler.handle(command);

        // Then - une nouvelle VueTournee est creee et sauvegardee
        ArgumentCaptor<VueTournee> captor = ArgumentCaptor.forClass(VueTournee.class);
        verify(vueTourneeRepository).save(captor.capture());
        VueTournee created = captor.getValue();
        assertThat(created.getTourneeId()).isEqualTo("T-NOUVEAU");
        assertThat(created.getColisTraites()).isEqualTo(1);
        assertThat(created.getStatut()).isEqualTo(StatutTourneeVue.EN_COURS);
        verify(broadcaster).broadcastTableauDeBord();
    }

    // ─── SC6 : Type inconnu sans crash ────────────────────────────────────────

    @Test
    @DisplayName("SC6 - Type d'evenement inconnu : log warn, pas de modification, pas d'exception")
    void typeInconnu_pas_dException_et_aucune_modification() {
        // Given
        when(processedEventJpaRepository.existsById("EVT-999")).thenReturn(false);
        when(vueTourneeRepository.findByTourneeId("T-001"))
                .thenReturn(Optional.of(new VueTournee("T-001", "Pierre", 1, 10,
                        StatutTourneeVue.EN_COURS, Instant.now())));

        EvenementTourneeCommand command = new EvenementTourneeCommand(
                "EVT-999", "TYPE_INCONNU", "T-001", "livreur-001", null, null,
                Instant.now().toString()
        );

        // When - ne doit pas lancer d'exception
        handler.handle(command);

        // Then - save est quand meme appele (on marque l'event traite) mais pas de broadcast
        verify(vueTourneeRepository, never()).save(any());
        verify(broadcaster, never()).broadcastTableauDeBord();
    }
}
