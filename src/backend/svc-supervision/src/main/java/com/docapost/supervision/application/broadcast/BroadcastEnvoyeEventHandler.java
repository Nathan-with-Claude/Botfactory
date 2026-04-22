package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.domain.broadcast.events.BroadcastEnvoye;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonEntity;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonJpaRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * BroadcastEnvoyeEventHandler — Application Service BC-03 / US-069
 *
 * Écoute le Domain Event BroadcastEnvoye et initialise la projection
 * broadcast_statut_livraison pour chaque livreur destinataire avec statut ENVOYE.
 *
 * Couplage nul avec EnvoyerBroadcastHandler : @EventListener uniquement.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
@Component
public class BroadcastEnvoyeEventHandler {

    private final BroadcastStatutLivraisonJpaRepository statutRepo;
    private final ConsulterEtatLivreursHandlerForBroadcast consulterEtatHandler;

    public BroadcastEnvoyeEventHandler(
            BroadcastStatutLivraisonJpaRepository statutRepo,
            ConsulterEtatLivreursHandlerForBroadcast consulterEtatHandler) {
        this.statutRepo = statutRepo;
        this.consulterEtatHandler = consulterEtatHandler;
    }

    /**
     * Pour chaque livreur destinataire, crée un BroadcastStatutLivraisonEntity
     * avec statut ENVOYE et le nom complet du livreur.
     *
     * @param event event BroadcastEnvoye émis par l'aggregate root
     */
    @EventListener
    public void onBroadcastEnvoye(BroadcastEnvoye event) {
        List<BroadcastStatutLivraisonEntity> statuts = event.livreurIds().stream()
                .map(livreurId -> {
                    String nomComplet = consulterEtatHandler.getNomComplet(livreurId);
                    BroadcastStatutLivraisonEntity entity = new BroadcastStatutLivraisonEntity();
                    entity.setBroadcastMessageId(event.broadcastMessageId());
                    entity.setLivreurId(livreurId);
                    entity.setNomCompletLivreur(nomComplet);
                    entity.setStatut("ENVOYE");
                    entity.setHorodatageVu(null);
                    return entity;
                })
                .toList();

        statutRepo.saveAll(statuts);
    }
}
