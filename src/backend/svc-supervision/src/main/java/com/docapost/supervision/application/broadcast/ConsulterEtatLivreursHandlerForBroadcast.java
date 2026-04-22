package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.application.planification.ConsulterEtatLivreursHandler;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * ConsulterEtatLivreursHandlerForBroadcast — Adaptateur BC-03 / US-069
 *
 * Fournit le nom complet d'un livreur à partir de son identifiant,
 * en s'appuyant sur le ConsulterEtatLivreursHandler (référentiel livreurs).
 *
 * Ce composant isole les handlers broadcast de la dépendance directe sur
 * ConsulterEtatLivreursHandler qui nécessite une date.
 *
 * Fallback : si le livreur est introuvable, retourne le livreurId.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
@Component
public class ConsulterEtatLivreursHandlerForBroadcast {

    private final ConsulterEtatLivreursHandler consulterEtatLivreursHandler;

    public ConsulterEtatLivreursHandlerForBroadcast(
            ConsulterEtatLivreursHandler consulterEtatLivreursHandler) {
        this.consulterEtatLivreursHandler = consulterEtatLivreursHandler;
    }

    /**
     * Retourne le nom complet du livreur, ou le livreurId si inconnu.
     *
     * @param livreurId identifiant du livreur
     * @return nom complet (ex: "Pierre Martin") ou livreurId en fallback
     */
    public String getNomComplet(String livreurId) {
        return consulterEtatLivreursHandler.handle(LocalDate.now())
                .stream()
                .filter(v -> livreurId.equals(v.livreurId()))
                .findFirst()
                .map(v -> v.nomComplet())
                .orElse(livreurId);
    }
}
