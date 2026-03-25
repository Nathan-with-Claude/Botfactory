package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.preuves.model.Coordonnees;
import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.docapost.tournee.domain.preuves.repository.PreuveLivraisonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Tests TDD — ConsulterPreuveLivraisonHandler (US-010)
 *
 * Vérifie :
 * 1. Retourne la preuve quand elle existe pour le colisId donné
 * 2. Lève PreuveNotFoundException si aucune preuve pour ce colisId
 * 3. Fonctionne avec et sans coordonnées GPS
 */
@ExtendWith(MockitoExtension.class)
class ConsulterPreuveLivraisonHandlerTest {

    @Mock
    private PreuveLivraisonRepository preuveLivraisonRepository;

    private ConsulterPreuveLivraisonHandler handler;

    @BeforeEach
    void setUp() {
        handler = new ConsulterPreuveLivraisonHandler(preuveLivraisonRepository);
    }

    @Test
    @DisplayName("retourne la preuve de type SIGNATURE quand elle existe")
    void handle_retourne_preuve_signature_quand_existante() {
        ColisId colisId = new ColisId("colis-001");
        TourneeId tourneeId = new TourneeId("tournee-001");
        PreuveLivraison preuve = PreuveLivraison.captureSignature(
                colisId, tourneeId, "signature".getBytes(),
                new Coordonnees(48.85, 2.35)
        );
        preuve.pullDomainEvents(); // consommer les events
        when(preuveLivraisonRepository.findByColisId(colisId)).thenReturn(Optional.of(preuve));

        ConsulterPreuveLivraisonQuery query = new ConsulterPreuveLivraisonQuery(colisId);
        PreuveLivraison result = handler.handle(query);

        assertThat(result).isNotNull();
        assertThat(result.getColisId()).isEqualTo(colisId);
        assertThat(result.getType().name()).isEqualTo("SIGNATURE");
        assertThat(result.getHorodatage()).isNotNull();
        assertThat(result.isModeDegradeGps()).isFalse();
    }

    @Test
    @DisplayName("retourne la preuve de type PHOTO sans coordonnées GPS (mode dégradé)")
    void handle_retourne_preuve_photo_mode_degrade_gps() {
        ColisId colisId = new ColisId("colis-002");
        TourneeId tourneeId = new TourneeId("tournee-001");
        PreuveLivraison preuve = PreuveLivraison.capturePhoto(
                colisId, tourneeId, "https://s3.example.com/photo.jpg", "sha256hash", null
        );
        preuve.pullDomainEvents();
        when(preuveLivraisonRepository.findByColisId(colisId)).thenReturn(Optional.of(preuve));

        PreuveLivraison result = handler.handle(new ConsulterPreuveLivraisonQuery(colisId));

        assertThat(result.isModeDegradeGps()).isTrue();
        assertThat(result.getType().name()).isEqualTo("PHOTO");
    }

    @Test
    @DisplayName("lève PreuveNotFoundException si aucune preuve pour ce colisId")
    void handle_leve_exception_si_preuve_absente() {
        ColisId colisId = new ColisId("colis-inconnu");
        when(preuveLivraisonRepository.findByColisId(colisId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> handler.handle(new ConsulterPreuveLivraisonQuery(colisId)))
                .isInstanceOf(PreuveNotFoundException.class)
                .hasMessageContaining("colis-inconnu");
    }

    @Test
    @DisplayName("retourne la preuve de type TIERS_IDENTIFIE")
    void handle_retourne_preuve_tiers_identifie() {
        ColisId colisId = new ColisId("colis-003");
        TourneeId tourneeId = new TourneeId("tournee-001");
        PreuveLivraison preuve = PreuveLivraison.captureTiers(
                colisId, tourneeId, "Jean Dupont", new Coordonnees(48.85, 2.35)
        );
        preuve.pullDomainEvents();
        when(preuveLivraisonRepository.findByColisId(colisId)).thenReturn(Optional.of(preuve));

        PreuveLivraison result = handler.handle(new ConsulterPreuveLivraisonQuery(colisId));

        assertThat(result.getType().name()).isEqualTo("TIERS_IDENTIFIE");
        assertThat(result.getTiersIdentifie()).isNotNull();
        assertThat(result.getTiersIdentifie().nomTiers()).isEqualTo("Jean Dupont");
    }
}
