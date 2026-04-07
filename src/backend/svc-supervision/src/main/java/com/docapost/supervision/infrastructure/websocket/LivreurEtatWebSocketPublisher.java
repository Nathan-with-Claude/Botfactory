package com.docapost.supervision.infrastructure.websocket;

import com.docapost.supervision.application.planification.ConsulterEtatLivreursHandler;
import com.docapost.supervision.domain.planification.events.AffectationEnregistree;
import com.docapost.supervision.domain.planification.events.DesaffectationEnregistree;
import com.docapost.supervision.domain.planification.events.TourneeLancee;
import com.docapost.supervision.interfaces.dto.LivreurEtatDTO;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * LivreurEtatWebSocketPublisher — Publisher STOMP pour les mises à jour d'état livreur / US-066
 *
 * Écoute les Domain Events BC-07 qui modifient l'état d'un livreur.
 * Recalcule le nouvel état depuis la source de vérité (TourneePlanifieeRepository)
 * et publie sur /topic/livreurs/etat.
 *
 * Couplage nul avec les handlers existants : @EventListener uniquement.
 *
 * Source : US-066
 */
@Component
public class LivreurEtatWebSocketPublisher {

    private static final String TOPIC = "/topic/livreurs/etat";

    private final SimpMessagingTemplate messagingTemplate;
    private final ConsulterEtatLivreursHandler handler;

    public LivreurEtatWebSocketPublisher(
            SimpMessagingTemplate messagingTemplate,
            ConsulterEtatLivreursHandler handler) {
        this.messagingTemplate = messagingTemplate;
        this.handler = handler;
    }

    /**
     * Réagit à AffectationEnregistree (US-023) : livreur passe SANS_TOURNEE → AFFECTE_NON_LANCE.
     */
    @EventListener
    public void onAffectationEnregistree(AffectationEnregistree event) {
        pushEtatLivreur(event.livreurId(), event.affecteeLe().atZone(java.time.ZoneOffset.UTC).toLocalDate());
    }

    /**
     * Réagit à DesaffectationEnregistree (US-050) : livreur passe AFFECTE_NON_LANCE → SANS_TOURNEE.
     */
    @EventListener
    public void onDesaffectationEnregistree(DesaffectationEnregistree event) {
        pushEtatLivreur(event.livreurIdRetire(), event.desaffecteeLe().atZone(java.time.ZoneOffset.UTC).toLocalDate());
    }

    /**
     * Réagit à TourneeLancee (US-024) : livreur passe AFFECTE_NON_LANCE → EN_COURS.
     */
    @EventListener
    public void onTourneeLancee(TourneeLancee event) {
        pushEtatLivreur(event.livreurId(), event.lanceeLe().atZone(java.time.ZoneOffset.UTC).toLocalDate());
    }

    private void pushEtatLivreur(String livreurId, LocalDate date) {
        handler.handle(date).stream()
                .filter(vue -> vue.livreurId().equals(livreurId))
                .findFirst()
                .map(LivreurEtatDTO::fromDomain)
                .ifPresent(dto -> messagingTemplate.convertAndSend(TOPIC, dto));
    }
}
