package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.Colis;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.repository.TourneeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Application Service — Use case : Consulter le detail d'un colis (US-004).
 *
 * Responsabilite : orchestration uniquement. Pas de logique metier ici.
 *
 * Flux :
 * 1. Charge la Tournee via le Repository (port domain) par son ID
 * 2. Cherche le Colis dans la liste des colis de la Tournee
 * 3. Leve ColisNotFoundException si le colis n'est pas dans la tournee
 * 4. Retourne le Colis (traduit en DTO par la couche Interface)
 *
 * Invariants preserves :
 * - Le colis est toujours cherche au sein de sa tournee (integrite metier)
 * - Aucune modification d'etat : use case en lecture seule
 *
 * Source domaine : BC-01 Orchestration de Tournee.
 */
@Service
@Transactional(readOnly = true)
public class ConsulterDetailColisHandler {

    private final TourneeRepository tourneeRepository;

    public ConsulterDetailColisHandler(TourneeRepository tourneeRepository) {
        this.tourneeRepository = tourneeRepository;
    }

    public Colis handle(ConsulterDetailColisCommand command) {
        // 1. Charger la Tournee par son ID
        Tournee tournee = tourneeRepository.findById(command.tourneeId())
                .orElseThrow(() -> new TourneeNotFoundException(
                        command.tourneeId().value(),
                        java.time.LocalDate.now()
                ));

        // 2. Chercher le Colis dans la Tournee
        return tournee.getColis().stream()
                .filter(c -> c.getId().equals(command.colisId()))
                .findFirst()
                .orElseThrow(() -> new ColisNotFoundException(
                        command.tourneeId().value(),
                        command.colisId().value()
                ));
    }
}
