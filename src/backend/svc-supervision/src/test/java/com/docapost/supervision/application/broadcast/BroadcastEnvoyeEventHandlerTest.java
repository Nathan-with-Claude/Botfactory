package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.domain.broadcast.TypeBroadcast;
import com.docapost.supervision.domain.broadcast.events.BroadcastEnvoye;
import com.docapost.supervision.domain.planification.model.EtatJournalierLivreur;
import com.docapost.supervision.domain.planification.model.VueLivreur;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonEntity;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonJpaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires — BroadcastEnvoyeEventHandler (US-069)
 *
 * Vérifie que lors de la réception d'un BroadcastEnvoye,
 * N BroadcastStatutLivraisonEntity sont créés avec statut ENVOYE.
 *
 * TDD : tests écrits avant l'implémentation.
 * Pas de contexte Spring — Mockito pur.
 */
class BroadcastEnvoyeEventHandlerTest {

    private BroadcastStatutLivraisonJpaRepository statutRepo;
    private ConsulterEtatLivreursHandlerForBroadcast consulterEtatHandler;
    private BroadcastEnvoyeEventHandler handler;

    @BeforeEach
    void setUp() {
        statutRepo = mock(BroadcastStatutLivraisonJpaRepository.class);
        consulterEtatHandler = mock(ConsulterEtatLivreursHandlerForBroadcast.class);
        handler = new BroadcastEnvoyeEventHandler(statutRepo, consulterEtatHandler);
    }

    @Test
    void creer_N_statuts_ENVOYE_pour_chaque_livreur_destinataire() {
        // Given
        List<String> livreurIds = List.of("livreur-001", "livreur-002", "livreur-003");
        BroadcastEnvoye event = new BroadcastEnvoye(
                "bc-uuid-001",
                TypeBroadcast.ALERTE,
                "Attention incident zone A",
                livreurIds,
                "superviseur-001",
                Instant.parse("2026-04-21T09:12:00Z")
        );

        when(consulterEtatHandler.getNomComplet("livreur-001")).thenReturn("Pierre Martin");
        when(consulterEtatHandler.getNomComplet("livreur-002")).thenReturn("Paul Dupont");
        when(consulterEtatHandler.getNomComplet("livreur-003")).thenReturn("Marie Lambert");

        // When
        handler.onBroadcastEnvoye(event);

        // Then : 3 entités sauvegardées avec statut ENVOYE
        verify(statutRepo).saveAll(argThat((List<BroadcastStatutLivraisonEntity> entities) -> {
            assertThat(entities).hasSize(3);
            assertThat(entities).allMatch(e -> "ENVOYE".equals(e.getStatut()));
            assertThat(entities).allMatch(e -> "bc-uuid-001".equals(e.getBroadcastMessageId()));
            assertThat(entities).allMatch(e -> e.getHorodatageVu() == null);
            assertThat(entities).extracting(BroadcastStatutLivraisonEntity::getLivreurId)
                    .containsExactlyInAnyOrder("livreur-001", "livreur-002", "livreur-003");
            return true;
        }));
    }

    @Test
    void chaque_statut_contient_le_nom_complet_du_livreur() {
        // Given
        BroadcastEnvoye event = new BroadcastEnvoye(
                "bc-uuid-002",
                TypeBroadcast.INFO,
                "Réunion 14h30",
                List.of("livreur-001"),
                "superviseur-001",
                Instant.now()
        );
        when(consulterEtatHandler.getNomComplet("livreur-001")).thenReturn("Pierre Martin");

        // When
        handler.onBroadcastEnvoye(event);

        // Then : le nom est bien enregistré
        verify(statutRepo).saveAll(argThat((List<BroadcastStatutLivraisonEntity> entities) -> {
            assertThat(entities).hasSize(1);
            assertThat(entities.get(0).getNomCompletLivreur()).isEqualTo("Pierre Martin");
            return true;
        }));
    }

    @Test
    void nom_complet_vide_si_livreur_inconnu() {
        // Given
        BroadcastEnvoye event = new BroadcastEnvoye(
                "bc-uuid-003",
                TypeBroadcast.CONSIGNE,
                "Port EPI obligatoire",
                List.of("livreur-inconnu"),
                "superviseur-001",
                Instant.now()
        );
        when(consulterEtatHandler.getNomComplet("livreur-inconnu")).thenReturn("livreur-inconnu");

        // When
        handler.onBroadcastEnvoye(event);

        // Then : fallback livreurId comme nom
        verify(statutRepo).saveAll(argThat((List<BroadcastStatutLivraisonEntity> entities) -> {
            assertThat(entities.get(0).getNomCompletLivreur()).isEqualTo("livreur-inconnu");
            return true;
        }));
    }
}
