package com.docapost.oms.application;

import com.docapost.oms.domain.model.EvenementLivraison;
import com.docapost.oms.domain.repository.EvenementStore;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Handler US-018 — Consulter l'historique complet d'un colis pour audit.
 *
 * Retourne les événements en ordre chronologique ascendant.
 * Utilisé par le superviseur pour reconstituer le parcours d'un colis en litige.
 */
@Service
public class ConsulterHistoriqueColisHandler {

    private final EvenementStore evenementStore;

    public ConsulterHistoriqueColisHandler(EvenementStore evenementStore) {
        this.evenementStore = evenementStore;
    }

    public List<EvenementLivraison> handle(ConsulterHistoriqueColisQuery query) {
        return evenementStore.findByColisId(query.colisId());
    }
}
