package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.Colis;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Application Service — Use case : Déclarer un échec de livraison (US-005).
 *
 * Responsabilité : orchestration uniquement. Pas de logique métier ici.
 * La logique (invariants, transitions de statut, émission d'events) est dans Tournee.
 *
 * Flux :
 * 1. Charge la Tournée via le Repository par son ID
 * 2. Délègue la déclaration d'échec à l'Aggregate Tournée
 *    (qui vérifie les invariants et émet EchecLivraisonDeclare)
 * 3. Sauvegarde la Tournée (persistance du nouveau statut + motif)
 * 4. Publie les Domain Events (pattern collect-and-publish) — TODO Kafka US-017
 * 5. Retourne le Colis mis à jour (traduit en DTO par la couche Interface)
 *
 * Invariants préservés :
 * - TourneeNotFoundException si la tournée n'existe pas
 * - ColisNotFoundException si le colis n'existe pas dans la tournée
 * - TourneeInvariantException si la transition est interdite (via l'Aggregate)
 *
 * Source domaine : BC-01 Orchestration de Tournée.
 */
@Service
@Transactional
public class DeclarerEchecLivraisonHandler {

    private final TourneeRepository tourneeRepository;

    public DeclarerEchecLivraisonHandler(TourneeRepository tourneeRepository) {
        this.tourneeRepository = tourneeRepository;
    }

    public Colis handle(DeclarerEchecLivraisonCommand command) {
        // 1. Charger la Tournée
        Tournee tournee = tourneeRepository.findById(command.tourneeId())
                .orElseThrow(() -> new TourneeNotFoundException(
                        command.tourneeId().value(),
                        java.time.LocalDate.now()
                ));

        // 2. Vérifier que le colis existe dans la tournée (sinon ColisNotFoundException)
        boolean colisExiste = tournee.getColis().stream()
                .anyMatch(c -> c.getId().equals(command.colisId()));
        if (!colisExiste) {
            throw new ColisNotFoundException(command.tourneeId().value(), command.colisId().value());
        }

        // 3. Déléguer à l'Aggregate (contient les invariants)
        //    Lève TourneeInvariantException si la transition est interdite
        Colis colisEchec = tournee.declarerEchecLivraison(
                command.colisId(),
                command.motif(),
                command.disposition(),
                command.noteLibre()
        );

        // 4. Sauvegarder la Tournée mise à jour
        tourneeRepository.save(tournee);

        // 5. Publier les Domain Events (TODO US-017 : publier vers Kafka/OMS)
        tournee.pullDomainEvents();

        return colisEchec;
    }
}
