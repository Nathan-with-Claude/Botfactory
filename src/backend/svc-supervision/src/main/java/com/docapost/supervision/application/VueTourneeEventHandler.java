package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import com.docapost.supervision.infrastructure.persistence.ProcessedEventEntity;
import com.docapost.supervision.infrastructure.persistence.ProcessedEventJpaRepository;
import com.docapost.supervision.infrastructure.persistence.VueColisJpaRepository;
import com.docapost.supervision.interfaces.websocket.TableauDeBordBroadcaster;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

/**
 * Application Service — VueTourneeEventHandler (US-032)
 *
 * Reçoit un EvenementTourneeCommand depuis le endpoint interne
 * POST /internal/vue-tournee/events et :
 *
 * 1. Verifie l'idempotence via la table processed_events (eventId unique).
 *    Si l'eventId est deja connu → retour immediat sans modification.
 * 2. Applique la mise a jour sur VueTournee selon le type d'evenement :
 *    - COLIS_LIVRE      → incremente colisTraites
 *    - ECHEC_DECLAREE   → incremente colisTraites (echec = traite)
 *    - TOURNEE_CLOTUREE → passe le statut a CLOTUREE
 * 3. Si la VueTournee n'existe pas encore → la cree avec des valeurs par defaut.
 * 4. Sauvegarde la VueTournee mise a jour.
 * 5. Enregistre l'eventId dans processed_events.
 * 6. Diffuse le tableau de bord mis a jour via WebSocket.
 *
 * Source : US-032 — "Synchroniser le read model supervision"
 */
@Service
public class VueTourneeEventHandler {

    private static final Logger log = LoggerFactory.getLogger(VueTourneeEventHandler.class);

    private final VueTourneeRepository vueTourneeRepository;
    private final VueColisJpaRepository vueColisJpaRepository;
    private final ProcessedEventJpaRepository processedEventJpaRepository;
    private final TableauDeBordBroadcaster broadcaster;

    public VueTourneeEventHandler(
            VueTourneeRepository vueTourneeRepository,
            VueColisJpaRepository vueColisJpaRepository,
            ProcessedEventJpaRepository processedEventJpaRepository,
            TableauDeBordBroadcaster broadcaster
    ) {
        this.vueTourneeRepository = vueTourneeRepository;
        this.vueColisJpaRepository = vueColisJpaRepository;
        this.processedEventJpaRepository = processedEventJpaRepository;
        this.broadcaster = broadcaster;
    }

    /**
     * Traite un evenement livreur entrant.
     * Idempotent : appeler deux fois avec le meme eventId n'a aucun effet la deuxieme fois.
     *
     * @param command evenement a traiter
     */
    @Transactional
    public void handle(EvenementTourneeCommand command) {
        // Idempotence : verifier si l'evenement a deja ete traite
        if (processedEventJpaRepository.existsById(command.eventId())) {
            log.debug("Evenement {} deja traite — ignore (idempotent)", command.eventId());
            return;
        }

        // Recuperer ou creer la VueTournee
        Optional<VueTournee> optVueTournee = vueTourneeRepository.findByTourneeId(command.tourneeId());
        VueTournee vueTournee = optVueTournee.orElseGet(() -> {
            log.info("VueTournee introuvable pour tourneeId={} — creation automatique", command.tourneeId());
            return new VueTournee(
                    command.tourneeId(),
                    command.livreurId(), // nom de livreur inconnu, on utilise l'ID en attendant
                    0,
                    0,
                    StatutTourneeVue.EN_COURS,
                    Instant.now()
            );
        });

        // Appliquer la mise a jour selon le type d'evenement
        boolean modifie = appliquerEvenement(command, vueTournee);

        if (!modifie) {
            log.warn("Type d'evenement inconnu : {} (eventId={}) — ignore sans modification",
                    command.eventType(), command.eventId());
            return;
        }

        // Sauvegarder le read model mis a jour
        vueTourneeRepository.save(vueTournee);

        // Marquer l'evenement comme traite (idempotence future)
        processedEventJpaRepository.save(new ProcessedEventEntity(command.eventId(), Instant.now()));

        // Broadcaster le tableau de bord mis a jour via WebSocket
        broadcaster.broadcastTableauDeBord();

        log.debug("Evenement {} ({}) traite pour tournee {} — colisTraites={}",
                command.eventId(), command.eventType(), command.tourneeId(), vueTournee.getColisTraites());
    }

    /**
     * Applique la mutation sur le read model selon le type d'evenement.
     * Met aussi a jour le statut du VueColis individuel si colisId est fourni.
     *
     * @param command commande complete (eventType, colisId, motif, horodatage)
     * @param vue     read model a muter
     * @return true si l'evenement a ete reconnu et applique, false sinon
     */
    private boolean appliquerEvenement(EvenementTourneeCommand command, VueTournee vue) {
        switch (command.eventType()) {
            case "COLIS_LIVRE" -> {
                vue.mettreAJourAvancement(vue.getColisTraites() + 1, vue.getColisTotal());
                mettreAJourVueColis(command.tourneeId(), command.colisId(), "LIVRE", null);
                return true;
            }
            case "ECHEC_DECLAREE" -> {
                // L'echec compte comme un colis traite (il ne sera pas re-livré dans cette tournee)
                vue.mettreAJourAvancement(vue.getColisTraites() + 1, vue.getColisTotal());
                mettreAJourVueColis(command.tourneeId(), command.colisId(), "ECHEC", command.motif());
                return true;
            }
            case "TOURNEE_CLOTUREE" -> {
                vue.cloturer();
                return true;
            }
            default -> {
                return false;
            }
        }
    }

    /**
     * Met a jour le statut du VueColis correspondant dans le read model BC-03.
     * No-op si le colisId est null ou si le VueColis n'existe pas encore.
     */
    private void mettreAJourVueColis(String tourneeId, String colisId, String statut, String motif) {
        if (colisId == null || colisId.isBlank()) return;
        vueColisJpaRepository.findByTourneeIdAndColisId(tourneeId, colisId).ifPresent(colis -> {
            colis.setStatut(statut);
            colis.setMotifEchec(motif);
            colis.setHorodatageTraitement(Instant.now());
            vueColisJpaRepository.save(colis);
        });
    }
}
