package com.docapost.supervision.infrastructure.websocket;

import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonJpaRepository;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastStatutUpdateDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * BroadcastStatutWebSocketPublisher — Publisher STOMP BC-03 / US-069
 *
 * Publie les mises à jour de compteur "Vu par N / M livreurs" sur le canal WebSocket
 * /topic/supervision/broadcasts/{date} lorsqu'un BroadcastVuEvent est traité.
 *
 * Suit exactement le pattern de LivreurEtatWebSocketPublisher.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
@Component
public class BroadcastStatutWebSocketPublisher {

    private static final String TOPIC_TEMPLATE = "/topic/supervision/broadcasts/%s";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final SimpMessagingTemplate messagingTemplate;
    private final BroadcastStatutLivraisonJpaRepository statutRepo;

    public BroadcastStatutWebSocketPublisher(
            SimpMessagingTemplate messagingTemplate,
            BroadcastStatutLivraisonJpaRepository statutRepo) {
        this.messagingTemplate = messagingTemplate;
        this.statutRepo = statutRepo;
    }

    /**
     * Calcule le compteur VU/total pour le broadcastMessageId donné
     * et publie sur /topic/supervision/broadcasts/{date-du-jour}.
     *
     * @param broadcastMessageId identifiant du BroadcastMessage mis à jour
     */
    public void publierMiseAJour(String broadcastMessageId) {
        var statuts = statutRepo.findAllByBroadcastMessageId(broadcastMessageId);
        if (statuts.isEmpty()) {
            return;
        }

        long nombreVus = statuts.stream()
                .filter(s -> "VU".equals(s.getStatut()))
                .count();
        int nombreTotal = statuts.size();

        BroadcastStatutUpdateDTO dto = new BroadcastStatutUpdateDTO(
                broadcastMessageId,
                (int) nombreVus,
                nombreTotal
        );

        String dateAujourdhui = LocalDate.now(ZoneOffset.UTC).format(DATE_FORMATTER);
        String topic = String.format(TOPIC_TEMPLATE, dateAujourdhui);
        messagingTemplate.convertAndSend(topic, dto);
    }
}
