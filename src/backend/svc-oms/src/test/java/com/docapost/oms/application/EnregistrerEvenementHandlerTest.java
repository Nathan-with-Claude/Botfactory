package com.docapost.oms.application;

import com.docapost.oms.domain.model.*;
import com.docapost.oms.domain.repository.EvenementStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires — EnregistrerEvenementHandler (US-018).
 */
@ExtendWith(MockitoExtension.class)
class EnregistrerEvenementHandlerTest {

    @Mock
    private EvenementStore evenementStore;

    private EnregistrerEvenementHandler handler;

    @BeforeEach
    void setUp() {
        handler = new EnregistrerEvenementHandler(evenementStore);
    }

    @Test
    void devrait_enregistrer_evenement_avec_coordonnees() {
        when(evenementStore.findById("evt-001")).thenReturn(Optional.empty());

        handler.handle(new EnregistrerEvenementCommand(
                "evt-001", "tournee-001", "colis-001", "livreur-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, Instant.now(),
                48.8566, 2.3522, "preuve-001", null
        ));

        ArgumentCaptor<EvenementLivraison> captor = ArgumentCaptor.forClass(EvenementLivraison.class);
        verify(evenementStore).append(captor.capture());

        EvenementLivraison saved = captor.getValue();
        assertThat(saved.eventId()).isEqualTo("evt-001");
        assertThat(saved.livreurId()).isEqualTo("livreur-001");
        assertThat(saved.type()).isEqualTo(TypeEvenement.LIVRAISON_CONFIRMEE);
        assertThat(saved.coordonnees()).isNotNull();
        assertThat(saved.modeDegradGPS()).isFalse();
        assertThat(saved.statutSynchronisation()).isEqualTo(StatutSynchronisation.PENDING);
        assertThat(saved.tentativesSynchronisation()).isEqualTo(0);
    }

    @Test
    void devrait_enregistrer_evenement_en_mode_degrade_gps() {
        when(evenementStore.findById("evt-gps-null")).thenReturn(Optional.empty());

        handler.handle(new EnregistrerEvenementCommand(
                "evt-gps-null", "tournee-001", "colis-002", "livreur-001",
                TypeEvenement.ECHEC_LIVRAISON_DECLARE, Instant.now(),
                null, null, null, "ABSENT"
        ));

        ArgumentCaptor<EvenementLivraison> captor = ArgumentCaptor.forClass(EvenementLivraison.class);
        verify(evenementStore).append(captor.capture());

        EvenementLivraison saved = captor.getValue();
        assertThat(saved.modeDegradGPS()).isTrue();
        assertThat(saved.coordonnees()).isNull();
        assertThat(saved.motifEchec()).isEqualTo("ABSENT");
    }

    @Test
    void devrait_rejeter_eventId_deja_existant_avec_409() {
        when(evenementStore.findById("evt-dupliquer")).thenReturn(Optional.of(
                new EvenementLivraison("evt-dupliquer", "t", "c", "l",
                        TypeEvenement.TOURNEE_DEMARREE, Instant.now(),
                        null, true, null, null,
                        StatutSynchronisation.SYNCHRONIZED, 1)
        ));

        assertThatThrownBy(() -> handler.handle(new EnregistrerEvenementCommand(
                "evt-dupliquer", "tournee-001", "colis-001", "livreur-001",
                TypeEvenement.LIVRAISON_CONFIRMEE, Instant.now(),
                48.8566, 2.3522, null, null
        ))).isInstanceOf(EvenementDejaExistantException.class)
                .hasMessageContaining("evt-dupliquer");

        verify(evenementStore, never()).append(any());
    }
}
