package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.domain.broadcast.events.BroadcastVuEvent;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonEntity;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonJpaRepository;
import com.docapost.supervision.infrastructure.websocket.BroadcastStatutWebSocketPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires — BroadcastVuEventHandler (US-069)
 *
 * Vérifie la transition ENVOYE → VU avec horodatage,
 * et la publication WebSocket après mise à jour.
 *
 * TDD : tests écrits avant l'implémentation.
 * Pas de contexte Spring — Mockito pur.
 */
class BroadcastVuEventHandlerTest {

    private BroadcastStatutLivraisonJpaRepository statutRepo;
    private BroadcastStatutWebSocketPublisher wsPublisher;
    private BroadcastVuEventHandler handler;

    @BeforeEach
    void setUp() {
        statutRepo = mock(BroadcastStatutLivraisonJpaRepository.class);
        wsPublisher = mock(BroadcastStatutWebSocketPublisher.class);
        handler = new BroadcastVuEventHandler(statutRepo, wsPublisher);
    }

    @Test
    void transition_ENVOYE_vers_VU_avec_horodatage() {
        // Given : un statut ENVOYE existant
        BroadcastStatutLivraisonEntity existant = new BroadcastStatutLivraisonEntity();
        existant.setBroadcastMessageId("bc-uuid-001");
        existant.setLivreurId("livreur-001");
        existant.setNomCompletLivreur("Pierre Martin");
        existant.setStatut("ENVOYE");
        existant.setHorodatageVu(null);

        Instant horodatageVu = Instant.parse("2026-04-21T09:14:00Z");
        BroadcastVuEvent event = new BroadcastVuEvent("bc-uuid-001", "livreur-001", horodatageVu);

        when(statutRepo.findByBroadcastMessageIdAndLivreurId("bc-uuid-001", "livreur-001"))
                .thenReturn(Optional.of(existant));

        // When
        handler.onBroadcastVu(event);

        // Then : statut mis à jour vers VU avec horodatage
        verify(statutRepo).save(argThat((BroadcastStatutLivraisonEntity saved) -> {
            assertThat(saved.getStatut()).isEqualTo("VU");
            assertThat(saved.getHorodatageVu()).isEqualTo(horodatageVu);
            return true;
        }));
    }

    @Test
    void publier_websocket_apres_mise_a_jour() {
        // Given
        BroadcastStatutLivraisonEntity existant = new BroadcastStatutLivraisonEntity();
        existant.setBroadcastMessageId("bc-uuid-001");
        existant.setLivreurId("livreur-001");
        existant.setNomCompletLivreur("Pierre Martin");
        existant.setStatut("ENVOYE");

        BroadcastVuEvent event = new BroadcastVuEvent("bc-uuid-001", "livreur-001", Instant.now());

        when(statutRepo.findByBroadcastMessageIdAndLivreurId("bc-uuid-001", "livreur-001"))
                .thenReturn(Optional.of(existant));

        // When
        handler.onBroadcastVu(event);

        // Then : publisher WebSocket appelé
        verify(wsPublisher).publierMiseAJour("bc-uuid-001");
    }

    @Test
    void ignorer_event_si_statut_introuvable() {
        // Given : aucun statut enregistré (livreur hors-cible ou event hors-ordre)
        BroadcastVuEvent event = new BroadcastVuEvent("bc-uuid-999", "livreur-999", Instant.now());

        when(statutRepo.findByBroadcastMessageIdAndLivreurId("bc-uuid-999", "livreur-999"))
                .thenReturn(Optional.empty());

        // When
        handler.onBroadcastVu(event);

        // Then : aucune sauvegarde ni publication
        verify(statutRepo, never()).save(any());
        verify(wsPublisher, never()).publierMiseAJour(any());
    }

    @Test
    void ignorer_si_deja_VU_idempotence() {
        // Given : statut déjà VU (event dupliqué)
        BroadcastStatutLivraisonEntity dejaVu = new BroadcastStatutLivraisonEntity();
        dejaVu.setBroadcastMessageId("bc-uuid-001");
        dejaVu.setLivreurId("livreur-001");
        dejaVu.setStatut("VU");
        dejaVu.setHorodatageVu(Instant.parse("2026-04-21T09:14:00Z"));

        BroadcastVuEvent event = new BroadcastVuEvent("bc-uuid-001", "livreur-001", Instant.now());

        when(statutRepo.findByBroadcastMessageIdAndLivreurId("bc-uuid-001", "livreur-001"))
                .thenReturn(Optional.of(dejaVu));

        // When
        handler.onBroadcastVu(event);

        // Then : aucune sauvegarde (déjà VU — idempotent)
        verify(statutRepo, never()).save(any());
        verify(wsPublisher, never()).publierMiseAJour(any());
    }
}
