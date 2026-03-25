package com.docapost.oms.application;

import com.docapost.oms.domain.model.EvenementLivraison;
import com.docapost.oms.domain.repository.EvenementStore;
import org.springframework.stereotype.Service;

import java.util.List;

/** Handler US-018 — Historique complet d'une tournée pour audit. */
@Service
public class ConsulterHistoriqueTourneeHandler {

    private final EvenementStore evenementStore;

    public ConsulterHistoriqueTourneeHandler(EvenementStore evenementStore) {
        this.evenementStore = evenementStore;
    }

    public List<EvenementLivraison> handle(ConsulterHistoriqueTourneeQuery query) {
        return evenementStore.findByTourneeId(query.tourneeId());
    }
}
