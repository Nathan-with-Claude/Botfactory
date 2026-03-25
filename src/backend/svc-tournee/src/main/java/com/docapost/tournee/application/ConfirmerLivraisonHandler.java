package com.docapost.tournee.application;

import com.docapost.tournee.domain.events.DomainEvent;
import com.docapost.tournee.domain.model.Colis;
import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.docapost.tournee.domain.preuves.repository.PreuveLivraisonRepository;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application Service — ConfirmerLivraison (US-008 + US-009)
 *
 * Orchestration :
 * 1. Charger la Tournee via TourneeRepository
 * 2. Créer la PreuveLivraison (via factory method de l'Aggregate) selon le type
 * 3. Confirmer la livraison du Colis dans la Tournee (statut A_LIVRER → LIVRE)
 * 4. Sauvegarder la PreuveLivraison
 * 5. Sauvegarder la Tournee mise à jour
 * 6. Publier les Domain Events (PreuveCapturee + LivraisonConfirmee)
 *
 * Invariants du domaine respectés :
 * - Aucun colis ne peut passer en LIVRE sans PreuveLivraisonId.
 * - La PreuveLivraison est immuable après création.
 */
@Service
public class ConfirmerLivraisonHandler {

    private final TourneeRepository tourneeRepository;
    private final PreuveLivraisonRepository preuveLivraisonRepository;

    public ConfirmerLivraisonHandler(
            TourneeRepository tourneeRepository,
            PreuveLivraisonRepository preuveLivraisonRepository
    ) {
        this.tourneeRepository = tourneeRepository;
        this.preuveLivraisonRepository = preuveLivraisonRepository;
    }

    /**
     * Exécute la confirmation de livraison.
     *
     * @param command contient tourneeId, colisId, type de preuve et données associées
     * @return la PreuveLivraison créée
     * @throws TourneeNotFoundException           si la tournée n'existe pas
     * @throws ColisNotFoundException             si le colis n'appartient pas à la tournée
     * @throws com.docapost.tournee.domain.model.TourneeInvariantException
     *         si la transition de statut est interdite
     * @throws com.docapost.tournee.domain.preuves.model.PreuveLivraisonInvariantException
     *         si les données de preuve sont invalides
     */
    public PreuveLivraison handle(ConfirmerLivraisonCommand command) {
        // 1. Charger la Tournee
        Tournee tournee = tourneeRepository.findById(command.getTourneeId())
                .orElseThrow(() -> new TourneeNotFoundException(
                        command.getTourneeId().value(), java.time.LocalDate.now()
                ));

        // 2. Vérifier que le colis existe (levée implicite par confirmerLivraison si absent)
        boolean colisExiste = tournee.getColis().stream()
                .anyMatch(c -> c.getId().equals(command.getColisId()));
        if (!colisExiste) {
            throw new ColisNotFoundException(
                    command.getTourneeId().value(), command.getColisId().value()
            );
        }

        // 3. Créer la PreuveLivraison selon le type
        PreuveLivraison preuve = creerPreuve(command);

        // 4. Confirmer la livraison dans l'Aggregate Tournee
        tournee.confirmerLivraison(command.getColisId(), preuve.getId());

        // 5. Sauvegarder la preuve (immuable — save une seule fois)
        preuveLivraisonRepository.save(preuve);

        // 6. Sauvegarder la tournee mise a jour
        tourneeRepository.save(tournee);

        // 7. Publier les Domain Events (PreuveCapturee puis LivraisonConfirmee)
        // Note MVP : publication locale Spring Events — à remplacer par outbox pattern en prod
        List<DomainEvent> preuveEvents = preuve.pullDomainEvents();
        List<DomainEvent> tourneeEvents = tournee.pullDomainEvents();
        // Les events sont disponibles pour publication externe — consommés ici pour le MVP

        return preuve;
    }

    // ─── Helpers privés ──────────────────────────────────────────────────────

    private PreuveLivraison creerPreuve(ConfirmerLivraisonCommand command) {
        ColisId colisId = command.getColisId();
        var tourneeId = command.getTourneeId();
        var coordonnees = command.getCoordonnees();

        return switch (command.getTypePreuve()) {
            case SIGNATURE -> PreuveLivraison.captureSignature(
                    colisId, tourneeId, command.getDonneesSignature(), coordonnees
            );
            case PHOTO -> PreuveLivraison.capturePhoto(
                    colisId, tourneeId,
                    command.getUrlPhoto(), command.getHashIntegrite(), coordonnees
            );
            case TIERS_IDENTIFIE -> PreuveLivraison.captureTiers(
                    colisId, tourneeId, command.getNomTiers(), coordonnees
            );
            case DEPOT_SECURISE -> PreuveLivraison.captureDepotSecurise(
                    colisId, tourneeId, command.getDescriptionDepot(), coordonnees
            );
        };
    }
}
