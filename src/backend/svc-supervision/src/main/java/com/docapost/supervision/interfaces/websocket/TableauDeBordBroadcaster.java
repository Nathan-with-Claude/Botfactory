package com.docapost.supervision.interfaces.websocket;

import com.docapost.supervision.application.ConsulterTableauDeBordHandler;
import com.docapost.supervision.application.ConsulterTableauDeBordQuery;
import com.docapost.supervision.domain.model.TableauDeBord;
import com.docapost.supervision.interfaces.dto.TableauDeBordDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * WebSocket Broadcaster — TableauDeBord (US-011)
 *
 * Envoie un TableauDeBordDTO mis à jour sur /topic/tableau-de-bord
 * à chaque fois qu'une VueTournee change (appelé par les handlers US-012/US-013).
 *
 * Source : US-011 — "Tableau de bord des tournées en temps réel"
 */
@Component
public class TableauDeBordBroadcaster {

    private static final String TOPIC_TABLEAU_DE_BORD = "/topic/tableau-de-bord";

    private final SimpMessagingTemplate messagingTemplate;
    private final ConsulterTableauDeBordHandler consulterTableauDeBordHandler;

    public TableauDeBordBroadcaster(
            SimpMessagingTemplate messagingTemplate,
            ConsulterTableauDeBordHandler consulterTableauDeBordHandler
    ) {
        this.messagingTemplate = messagingTemplate;
        this.consulterTableauDeBordHandler = consulterTableauDeBordHandler;
    }

    /**
     * Recharge le tableau de bord complet et le broadcast sur le topic WebSocket.
     * Appelé après chaque modification d'une VueTournee.
     */
    public void broadcastTableauDeBord() {
        TableauDeBord tableau = consulterTableauDeBordHandler.handle(
                ConsulterTableauDeBordQuery.sansFiltre()
        );
        messagingTemplate.convertAndSend(
                TOPIC_TABLEAU_DE_BORD,
                TableauDeBordDTO.from(tableau)
        );
    }
}
