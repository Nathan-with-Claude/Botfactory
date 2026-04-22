package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.domain.broadcast.events.BroadcastVuEvent;
import com.docapost.supervision.domain.broadcast.repository.BroadcastMessageRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * MarquerBroadcastVuHandler — Application Service BC-03 / US-068
 *
 * Orchestre l'acquittement d'un BroadcastMessage par un livreur :
 * 1. Vérifie que le BroadcastMessage existe (404 sinon)
 * 2. Vérifie que le livreurId est dans la liste des destinataires (403 sinon)
 * 3. L'idempotence est garantie par le contrôleur appelant (l'event est publié
 *    uniquement si le livreur n'a pas déjà acquitté — vérifié par l'appelant)
 * 4. Publie le Domain Event BroadcastVuEvent via ApplicationEventPublisher
 *    (US-069 en fera la projection dans BroadcastStatutLivraison)
 *
 * Note : aucune écriture en base à ce stade — US-069 crée la table de projection.
 *
 * Source : US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 */
@Service
public class MarquerBroadcastVuHandler {

    private final BroadcastMessageRepository broadcastMessageRepository;
    private final ApplicationEventPublisher eventPublisher;

    public MarquerBroadcastVuHandler(
            BroadcastMessageRepository broadcastMessageRepository,
            ApplicationEventPublisher eventPublisher) {
        this.broadcastMessageRepository = broadcastMessageRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Exécute la commande de marquage "vu".
     *
     * @param command commande contenant broadcastMessageId et livreurId
     * @throws BroadcastMessageInconnuException si le broadcastMessageId n'existe pas (→ 404)
     * @throws LivreurNonDestinataireException  si le livreurId n'est pas destinataire (→ 403)
     */
    public void handle(MarquerBroadcastVuCommand command) {
        String broadcastMessageId = command.broadcastMessageId();
        String livreurId = command.livreurId();

        com.docapost.supervision.domain.broadcast.BroadcastMessage message =
                broadcastMessageRepository.findById(broadcastMessageId)
                        .orElseThrow(() -> new BroadcastMessageInconnuException(broadcastMessageId));

        if (!message.getLivreurIds().contains(livreurId)) {
            throw new LivreurNonDestinataireException(livreurId, broadcastMessageId);
        }

        eventPublisher.publishEvent(new BroadcastVuEvent(
                command.broadcastMessageId(),
                command.livreurId(),
                Instant.now()
        ));
    }
}
