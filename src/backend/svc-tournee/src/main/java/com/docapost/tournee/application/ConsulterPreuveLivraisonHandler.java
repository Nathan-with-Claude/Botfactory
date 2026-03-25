package com.docapost.tournee.application;

import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.docapost.tournee.domain.preuves.repository.PreuveLivraisonRepository;
import org.springframework.stereotype.Service;

/**
 * Application Service — Consulter la preuve de livraison d'un colis (US-010).
 *
 * Orchestration :
 * 1. Recherche la PreuveLivraison par colisId dans le repository
 * 2. Lève PreuveNotFoundException si absente (→ HTTP 404)
 *
 * Accès restreint aux rôles SUPPORT / SUPERVISEUR (contrôle dans PreuveController).
 *
 * Source : US-010 — "Consulter la preuve d'une livraison pour traiter un litige"
 */
@Service
public class ConsulterPreuveLivraisonHandler {

    private final PreuveLivraisonRepository preuveLivraisonRepository;

    public ConsulterPreuveLivraisonHandler(PreuveLivraisonRepository preuveLivraisonRepository) {
        this.preuveLivraisonRepository = preuveLivraisonRepository;
    }

    /**
     * Retourne la PreuveLivraison associée au colisId de la query.
     *
     * @param query contient le colisId recherché
     * @return PreuveLivraison immuable
     * @throws PreuveNotFoundException si aucune preuve trouvée pour ce colis
     */
    public PreuveLivraison handle(ConsulterPreuveLivraisonQuery query) {
        return preuveLivraisonRepository
                .findByColisId(query.colisId())
                .orElseThrow(() -> new PreuveNotFoundException(query.colisId().value()));
    }
}
