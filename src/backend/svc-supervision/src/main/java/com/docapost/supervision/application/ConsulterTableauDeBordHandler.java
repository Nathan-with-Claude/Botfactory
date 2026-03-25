package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.TableauDeBord;
import com.docapost.supervision.domain.model.VueTournee;
import com.docapost.supervision.domain.repository.VueTourneeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Application Service — Consulter le tableau de bord des tournées (US-011).
 *
 * Orchestration :
 * 1. Si filtreStatut est null → retourne toutes les tournées
 * 2. Sinon → filtre par statut
 * 3. Construit TableauDeBord avec les compteurs du bandeau
 *
 * Source : US-011 — "Tableau de bord des tournées en temps réel"
 */
@Service
public class ConsulterTableauDeBordHandler {

    private final VueTourneeRepository vueTourneeRepository;

    public ConsulterTableauDeBordHandler(VueTourneeRepository vueTourneeRepository) {
        this.vueTourneeRepository = vueTourneeRepository;
    }

    /**
     * Retourne le TableauDeBord (filtré ou complet) pour le superviseur.
     *
     * @param query contient le filtre de statut optionnel
     * @return TableauDeBord avec liste + compteurs bandeau
     */
    public TableauDeBord handle(ConsulterTableauDeBordQuery query) {
        List<VueTournee> tournees;

        if (query.filtreStatut() != null) {
            tournees = vueTourneeRepository.findByStatut(query.filtreStatut());
        } else {
            tournees = vueTourneeRepository.findAll();
        }

        return TableauDeBord.of(tournees);
    }
}
