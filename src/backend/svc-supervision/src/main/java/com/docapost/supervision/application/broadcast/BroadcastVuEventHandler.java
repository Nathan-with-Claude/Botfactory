package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.domain.broadcast.events.BroadcastVuEvent;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonEntity;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonJpaRepository;
import com.docapost.supervision.infrastructure.websocket.BroadcastStatutWebSocketPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * BroadcastVuEventHandler — Application Service BC-03 / US-069
 *
 * Écoute le Domain Event BroadcastVuEvent et effectue :
 * 1. Transition ENVOYE → VU avec horodatage dans broadcast_statut_livraison
 * 2. Publication WebSocket vers le superviseur (compteur mis à jour)
 *
 * Idempotent : si le statut est déjà VU, aucune action n'est effectuée.
 * Si l'entité est introuvable (event hors-ordre), l'event est ignoré.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
@Component
public class BroadcastVuEventHandler {

    private final BroadcastStatutLivraisonJpaRepository statutRepo;
    private final BroadcastStatutWebSocketPublisher wsPublisher;

    public BroadcastVuEventHandler(
            BroadcastStatutLivraisonJpaRepository statutRepo,
            BroadcastStatutWebSocketPublisher wsPublisher) {
        this.statutRepo = statutRepo;
        this.wsPublisher = wsPublisher;
    }

    /**
     * Traite la lecture d'un broadcast par un livreur.
     * Met à jour la projection et publie sur WebSocket.
     *
     * @param event event BroadcastVuEvent avec broadcastMessageId, livreurId, horodatageVu
     */
    @EventListener
    public void onBroadcastVu(BroadcastVuEvent event) {
        Optional<BroadcastStatutLivraisonEntity> optStatut = statutRepo
                .findByBroadcastMessageIdAndLivreurId(
                        event.broadcastMessageId(),
                        event.livreurId());

        if (optStatut.isEmpty()) {
            // Event hors-ordre ou livreur non-destinataire : ignorer
            return;
        }

        BroadcastStatutLivraisonEntity statut = optStatut.get();

        // Idempotence : déjà VU → ne rien faire
        if ("VU".equals(statut.getStatut())) {
            return;
        }

        // Transition ENVOYE → VU
        statut.setStatut("VU");
        statut.setHorodatageVu(event.horodatageVu());
        statutRepo.save(statut);

        // Publier la mise à jour en temps réel
        wsPublisher.publierMiseAJour(event.broadcastMessageId());
    }
}
