package com.docapost.oms.application;

import com.docapost.oms.domain.model.*;
import com.docapost.oms.domain.repository.EvenementStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.*;

/**
 * Tests unitaires — SynchroniserPendingEvenementsHandler (US-017).
 */
@ExtendWith(MockitoExtension.class)
class SynchroniserPendingEvenementsHandlerTest {

    @Mock
    private EvenementStore evenementStore;

    @Mock
    private OmsApiPort omsApiPort;

    private SynchroniserPendingEvenementsHandler handler;

    @BeforeEach
    void setUp() {
        handler = new SynchroniserPendingEvenementsHandler(evenementStore, omsApiPort);
    }

    private EvenementLivraison buildPending(String eventId) {
        return new EvenementLivraison(
                eventId, "tournee-001", "colis-001", "livreur-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, Instant.now(),
                new Coordonnees(48.8566, 2.3522), false, null, null,
                StatutSynchronisation.PENDING, 0
        );
    }

    @Test
    void devrait_synchroniser_evenement_pending_avec_succes() {
        EvenementLivraison ev = buildPending("evt-001");
        when(evenementStore.findEnAttente()).thenReturn(List.of(ev));
        when(omsApiPort.transmettre(ev)).thenReturn(true);

        handler.handle();

        verify(omsApiPort).transmettre(ev);
        verify(evenementStore).updateStatut("evt-001", StatutSynchronisation.SYNCHRONIZED, 1);
    }

    @Test
    void devrait_marquer_FAILED_si_oms_indisponible() {
        EvenementLivraison ev = buildPending("evt-002");
        when(evenementStore.findEnAttente()).thenReturn(List.of(ev));
        when(omsApiPort.transmettre(ev)).thenReturn(false);

        handler.handle();

        verify(evenementStore).updateStatut("evt-002", StatutSynchronisation.FAILED, 1);
    }

    @Test
    void devrait_marquer_FAILED_si_exception_oms() {
        EvenementLivraison ev = buildPending("evt-003");
        when(evenementStore.findEnAttente()).thenReturn(List.of(ev));
        when(omsApiPort.transmettre(ev)).thenThrow(new RuntimeException("Timeout OMS"));

        handler.handle();

        verify(evenementStore).updateStatut("evt-003", StatutSynchronisation.FAILED, 1);
    }

    @Test
    void devrait_ne_rien_faire_si_aucun_evenement_en_attente() {
        when(evenementStore.findEnAttente()).thenReturn(List.of());

        handler.handle();

        verify(omsApiPort, never()).transmettre(any());
        verify(evenementStore, never()).updateStatut(any(), any(), anyInt());
    }

    @Test
    void devrait_traiter_plusieurs_evenements_independamment() {
        EvenementLivraison ev1 = buildPending("evt-A");
        EvenementLivraison ev2 = buildPending("evt-B");
        when(evenementStore.findEnAttente()).thenReturn(List.of(ev1, ev2));
        when(omsApiPort.transmettre(ev1)).thenReturn(true);
        when(omsApiPort.transmettre(ev2)).thenReturn(false);

        handler.handle();

        verify(evenementStore).updateStatut("evt-A", StatutSynchronisation.SYNCHRONIZED, 1);
        verify(evenementStore).updateStatut("evt-B", StatutSynchronisation.FAILED, 1);
    }
}
