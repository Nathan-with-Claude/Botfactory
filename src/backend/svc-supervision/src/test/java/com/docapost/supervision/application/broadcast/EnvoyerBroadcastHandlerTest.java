package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.domain.broadcast.BroadcastCiblage;
import com.docapost.supervision.domain.broadcast.BroadcastMessage;
import com.docapost.supervision.domain.broadcast.BroadcastSecteur;
import com.docapost.supervision.domain.broadcast.TypeBroadcast;
import com.docapost.supervision.domain.broadcast.TypeCiblage;
import com.docapost.supervision.domain.broadcast.repository.BroadcastMessageRepository;
import com.docapost.supervision.domain.broadcast.repository.BroadcastSecteurRepository;
import com.docapost.supervision.domain.broadcast.repository.FcmTokenRepository;
import com.docapost.supervision.domain.planification.model.EtatJournalierLivreur;
import com.docapost.supervision.domain.planification.model.VueLivreur;
import com.docapost.supervision.application.planification.ConsulterEtatLivreursHandler;
import com.docapost.supervision.infrastructure.broadcast.FcmBroadcastAdapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires — EnvoyerBroadcastHandler (US-067)
 *
 * TDD : tests écrits avant l'implémentation.
 * Pas de contexte Spring — Mockito pur.
 */
class EnvoyerBroadcastHandlerTest {

    private ConsulterEtatLivreursHandler consulterEtatLivreursHandler;
    private BroadcastSecteurRepository broadcastSecteurRepository;
    private BroadcastMessageRepository broadcastMessageRepository;
    private FcmTokenRepository fcmTokenRepository;
    private FcmBroadcastAdapter fcmBroadcastAdapter;

    private EnvoyerBroadcastHandler handler;

    @BeforeEach
    void setUp() {
        consulterEtatLivreursHandler = mock(ConsulterEtatLivreursHandler.class);
        broadcastSecteurRepository = mock(BroadcastSecteurRepository.class);
        broadcastMessageRepository = mock(BroadcastMessageRepository.class);
        fcmTokenRepository = mock(FcmTokenRepository.class);
        fcmBroadcastAdapter = mock(FcmBroadcastAdapter.class);

        handler = new EnvoyerBroadcastHandler(
                consulterEtatLivreursHandler,
                broadcastSecteurRepository,
                broadcastMessageRepository,
                fcmTokenRepository,
                fcmBroadcastAdapter
        );
    }

    // ─── Scenario nominal : ciblage TOUS ────────────────────────────────────────

    @Test
    void scenario1_ciblage_tous_4_livreurs_en_cours_broadcast_cree_et_fcm_appele() {
        // Given : 4 livreurs EN_COURS (+ 2 autres états)
        when(consulterEtatLivreursHandler.handle(any(LocalDate.class))).thenReturn(List.of(
                new VueLivreur("livreur-001", "Pierre Martin", EtatJournalierLivreur.EN_COURS, "tp-201", "T-201"),
                new VueLivreur("livreur-002", "Paul Dupont", EtatJournalierLivreur.EN_COURS, "tp-202", "T-202"),
                new VueLivreur("livreur-003", "Marie Lambert", EtatJournalierLivreur.AFFECTE_NON_LANCE, "tp-203", "T-203"),
                new VueLivreur("livreur-004", "Jean Moreau", EtatJournalierLivreur.EN_COURS, "tp-204", "T-204"),
                new VueLivreur("livreur-005", "Sophie Bernard", EtatJournalierLivreur.EN_COURS, "tp-205", "T-205"),
                new VueLivreur("livreur-006", "Lucas Petit", EtatJournalierLivreur.SANS_TOURNEE, null, null)
        ));
        when(fcmTokenRepository.findTokensByLivreurIds(anyList())).thenReturn(Map.of(
                "livreur-001", "token-001",
                "livreur-002", "token-002",
                "livreur-004", "token-004",
                "livreur-005", "token-005"
        ));
        when(broadcastMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EnvoyerBroadcastCommand command = new EnvoyerBroadcastCommand(
                "superviseur-001",
                TypeBroadcast.ALERTE,
                "Rue Gambetta barrée, prenez la rue Victor Hugo",
                new BroadcastCiblage(TypeCiblage.TOUS, List.of())
        );

        // When
        BroadcastResultat resultat = handler.handle(command);

        // Then
        assertThat(resultat.nombreDestinataires()).isEqualTo(4);
        assertThat(resultat.broadcastMessageId()).isNotNull();

        verify(broadcastMessageRepository).save(any(BroadcastMessage.class));
        verify(fcmBroadcastAdapter).envoyerMulticast(
                argThat(tokens -> tokens.size() == 4),
                eq(TypeBroadcast.ALERTE),
                eq("Rue Gambetta barrée, prenez la rue Victor Hugo"),
                anyString()
        );
    }

    // ─── Scenario 2 : ciblage SECTEUR ────────────────────────────────────────────

    @Test
    void scenario2_ciblage_secteur_filtre_livreurs_par_zone() {
        // Given : 6 livreurs dont 2 dans SECT-IDF-02
        when(consulterEtatLivreursHandler.handle(any(LocalDate.class))).thenReturn(List.of(
                new VueLivreur("livreur-001", "Pierre Martin", EtatJournalierLivreur.EN_COURS, "tp-201", "T-201"),
                new VueLivreur("livreur-002", "Paul Dupont", EtatJournalierLivreur.EN_COURS, "tp-202", "T-202"),
                new VueLivreur("livreur-003", "Marie Lambert", EtatJournalierLivreur.EN_COURS, "tp-203", "T-203"),
                new VueLivreur("livreur-004", "Jean Moreau", EtatJournalierLivreur.EN_COURS, "tp-204", "T-204")
        ));
        // Secteur SECT-IDF-02 : livreurs-002 et livreur-004
        when(broadcastSecteurRepository.findAllActifs()).thenReturn(List.of(
                new BroadcastSecteur("SECT-IDF-01", "Secteur 1 — Nord Essonne", true,
                        List.of("livreur-001", "livreur-003")),
                new BroadcastSecteur("SECT-IDF-02", "Secteur 2 — Sud Essonne", true,
                        List.of("livreur-002", "livreur-004"))
        ));
        when(fcmTokenRepository.findTokensByLivreurIds(anyList())).thenReturn(Map.of(
                "livreur-002", "token-002",
                "livreur-004", "token-004"
        ));
        when(broadcastMessageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EnvoyerBroadcastCommand command = new EnvoyerBroadcastCommand(
                "superviseur-001",
                TypeBroadcast.CONSIGNE,
                "Ne pas livrer les sous-sols en cas de pluie — directive sécurité",
                new BroadcastCiblage(TypeCiblage.SECTEUR, List.of("SECT-IDF-02"))
        );

        // When
        BroadcastResultat resultat = handler.handle(command);

        // Then : uniquement les 2 livreurs du secteur
        assertThat(resultat.nombreDestinataires()).isEqualTo(2);
        verify(fcmBroadcastAdapter).envoyerMulticast(
                argThat(tokens -> tokens.size() == 2),
                eq(TypeBroadcast.CONSIGNE),
                anyString(),
                anyString()
        );
    }

    // ─── Scenario 3 : rejet si aucun livreur actif ────────────────────────────────

    @Test
    void scenario3_aucun_livreur_actif_dans_ciblage_leve_exception() {
        when(consulterEtatLivreursHandler.handle(any(LocalDate.class))).thenReturn(List.of(
                new VueLivreur("livreur-001", "Pierre Martin", EtatJournalierLivreur.SANS_TOURNEE, null, null),
                new VueLivreur("livreur-002", "Paul Dupont", EtatJournalierLivreur.AFFECTE_NON_LANCE, "tp-202", "T-202")
        ));

        EnvoyerBroadcastCommand command = new EnvoyerBroadcastCommand(
                "superviseur-001",
                TypeBroadcast.INFO,
                "Information dépôt relais",
                new BroadcastCiblage(TypeCiblage.TOUS, List.of())
        );

        // When / Then
        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(AucunLivreurActifException.class);

        verify(broadcastMessageRepository, never()).save(any());
        verify(fcmBroadcastAdapter, never()).envoyerMulticast(any(), any(), any(), any());
    }

    // ─── Scenario 4 : invariant texte vide ────────────────────────────────────────

    @Test
    void scenario4_texte_vide_leve_illegal_argument_exception() {
        when(consulterEtatLivreursHandler.handle(any(LocalDate.class))).thenReturn(List.of(
                new VueLivreur("livreur-001", "Pierre Martin", EtatJournalierLivreur.EN_COURS, "tp-201", "T-201")
        ));
        when(fcmTokenRepository.findTokensByLivreurIds(anyList())).thenReturn(Map.of("livreur-001", "token-001"));

        EnvoyerBroadcastCommand command = new EnvoyerBroadcastCommand(
                "superviseur-001",
                TypeBroadcast.ALERTE,
                "",
                new BroadcastCiblage(TypeCiblage.TOUS, List.of())
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("texte");
    }

    // ─── Scenario 5 : invariant texte > 280 caractères ────────────────────────────

    @Test
    void scenario5_texte_superieur_280_chars_leve_illegal_argument_exception() {
        when(consulterEtatLivreursHandler.handle(any(LocalDate.class))).thenReturn(List.of(
                new VueLivreur("livreur-001", "Pierre Martin", EtatJournalierLivreur.EN_COURS, "tp-201", "T-201")
        ));
        when(fcmTokenRepository.findTokensByLivreurIds(anyList())).thenReturn(Map.of("livreur-001", "token-001"));

        String texte281 = "A".repeat(281);
        EnvoyerBroadcastCommand command = new EnvoyerBroadcastCommand(
                "superviseur-001",
                TypeBroadcast.ALERTE,
                texte281,
                new BroadcastCiblage(TypeCiblage.TOUS, List.of())
        );

        assertThatThrownBy(() -> handler.handle(command))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("280");
    }
}
