package com.docapost.supervision.application;

import com.docapost.supervision.domain.model.VueTourneeDetail;
import com.docapost.supervision.domain.repository.VueTourneeDetailRepository;
import org.springframework.stereotype.Service;

/**
 * Application Service — Consulter le détail d'une tournée superviseur (US-012).
 *
 * Orchestration :
 * 1. Recherche le VueTourneeDetail dans le repository
 * 2. Lève TourneeSupervisionNotFoundException si absent (→ HTTP 404)
 *
 * Source : US-012 — "Détail d'une tournée superviseur"
 */
@Service
public class ConsulterDetailTourneeHandler {

    private final VueTourneeDetailRepository vueTourneeDetailRepository;

    public ConsulterDetailTourneeHandler(VueTourneeDetailRepository vueTourneeDetailRepository) {
        this.vueTourneeDetailRepository = vueTourneeDetailRepository;
    }

    /**
     * Retourne le VueTourneeDetail pour le tourneeId de la query.
     *
     * @param query contient le tourneeId recherché
     * @return VueTourneeDetail avec colis + incidents
     * @throws TourneeSupervisionNotFoundException si introuvable
     */
    public VueTourneeDetail handle(ConsulterDetailTourneeQuery query) {
        return vueTourneeDetailRepository
                .findByTourneeId(query.tourneeId())
                .orElseThrow(() -> new TourneeSupervisionNotFoundException(query.tourneeId()));
    }
}
