package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.application.planification.ConsulterEtatLivreursHandler;
import com.docapost.supervision.domain.broadcast.BroadcastMessage;
import com.docapost.supervision.domain.broadcast.TypeCiblage;
import com.docapost.supervision.domain.broadcast.repository.BroadcastMessageRepository;
import com.docapost.supervision.domain.broadcast.repository.BroadcastSecteurRepository;
import com.docapost.supervision.domain.broadcast.repository.FcmTokenRepository;
import com.docapost.supervision.domain.planification.model.EtatJournalierLivreur;
import com.docapost.supervision.domain.planification.model.VueLivreur;
import com.docapost.supervision.infrastructure.broadcast.FcmBroadcastAdapter;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * EnvoyerBroadcastHandler — Application Service BC-03 / US-067
 *
 * Orchestre l'envoi d'un broadcast :
 * 1. Résout les livreurs actifs (EN_COURS) via ConsulterEtatLivreursHandler
 * 2. Filtre par secteur si ciblage SECTEUR (intersection avec livreurIds du secteur)
 * 3. Lève AucunLivreurActifException si la liste est vide
 * 4. Délègue la création à BroadcastMessage.envoyer(...) (logique domaine)
 * 5. Persiste l'aggregate
 * 6. Publie les events domaine (clearEvenements)
 * 7. Récupère les tokens FCM et délègue l'envoi à FcmBroadcastAdapter
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Service
public class EnvoyerBroadcastHandler {

    private final ConsulterEtatLivreursHandler consulterEtatLivreursHandler;
    private final BroadcastSecteurRepository broadcastSecteurRepository;
    private final BroadcastMessageRepository broadcastMessageRepository;
    private final FcmTokenRepository fcmTokenRepository;
    private final FcmBroadcastAdapter fcmBroadcastAdapter;
    private final ApplicationEventPublisher eventPublisher;

    public EnvoyerBroadcastHandler(
            ConsulterEtatLivreursHandler consulterEtatLivreursHandler,
            BroadcastSecteurRepository broadcastSecteurRepository,
            BroadcastMessageRepository broadcastMessageRepository,
            FcmTokenRepository fcmTokenRepository,
            FcmBroadcastAdapter fcmBroadcastAdapter,
            ApplicationEventPublisher eventPublisher) {
        this.consulterEtatLivreursHandler = consulterEtatLivreursHandler;
        this.broadcastSecteurRepository = broadcastSecteurRepository;
        this.broadcastMessageRepository = broadcastMessageRepository;
        this.fcmTokenRepository = fcmTokenRepository;
        this.fcmBroadcastAdapter = fcmBroadcastAdapter;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Exécute la commande d'envoi de broadcast.
     *
     * @param command commande contenant superviseurId, type, texte, ciblage
     * @return BroadcastResultat avec l'id créé, le nombre de destinataires et l'horodatage
     * @throws AucunLivreurActifException si aucun livreur EN_COURS ne correspond au ciblage
     * @throws IllegalArgumentException   si le texte est vide ou dépasse 280 caractères (domaine)
     */
    public BroadcastResultat handle(EnvoyerBroadcastCommand command) {
        // 1. Résoudre les livreurs EN_COURS du jour
        List<String> livreursEnCours = consulterEtatLivreursHandler
                .handle(LocalDate.now())
                .stream()
                .filter(v -> EtatJournalierLivreur.EN_COURS.equals(v.etat()))
                .map(VueLivreur::livreurId)
                .toList();

        // 2. Filtrer par secteur si ciblage SECTEUR
        List<String> livreurIds;
        if (TypeCiblage.SECTEUR.equals(command.ciblage().type())
                && !command.ciblage().secteurs().isEmpty()) {

            // Construire l'ensemble des livreurIds appartenant aux secteurs demandés
            Set<String> livreursDesSecteurs = broadcastSecteurRepository.findAllActifs()
                    .stream()
                    .filter(s -> command.ciblage().secteurs().contains(s.codeSecteur()))
                    .flatMap(s -> s.livreurIds().stream())
                    .collect(Collectors.toSet());

            // Intersection : livreurs EN_COURS ET dans les secteurs demandés
            livreurIds = livreursEnCours.stream()
                    .filter(livreursDesSecteurs::contains)
                    .toList();
        } else {
            livreurIds = livreursEnCours;
        }

        // 3. Lever exception si aucun livreur actif dans le ciblage
        if (livreurIds.isEmpty()) {
            throw new AucunLivreurActifException();
        }

        // 4. Déléguer la création de l'aggregate au domaine (invariants validés ici)
        String id = UUID.randomUUID().toString();
        BroadcastMessage message = BroadcastMessage.envoyer(
                id,
                command.type(),
                command.texte(),
                command.ciblage(),
                command.superviseurId(),
                livreurIds
        );

        // 5. Persister l'aggregate
        broadcastMessageRepository.save(message);

        // 6. Publier les domain events collectés, puis vider
        message.getEvenements().forEach(eventPublisher::publishEvent);
        message.clearEvenements();

        // 7. Récupérer les tokens FCM et envoyer en multicast
        Map<String, String> tokensByLivreurId = fcmTokenRepository.findTokensByLivreurIds(livreurIds);
        List<String> tokens = List.copyOf(tokensByLivreurId.values());
        fcmBroadcastAdapter.envoyerMulticast(tokens, command.type(), command.texte(), id);

        return new BroadcastResultat(id, livreurIds.size(), message.getHorodatageEnvoi());
    }
}
