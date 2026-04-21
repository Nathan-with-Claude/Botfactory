package com.docapost.supervision.domain.broadcast.repository;

import com.docapost.supervision.domain.broadcast.BroadcastSecteur;

import java.util.List;

/**
 * BroadcastSecteurRepository — Port (interface domaine) BC-03 / US-067
 *
 * Contrat d'accès aux secteurs broadcast actifs.
 * L'implémentation concrète se trouve dans l'infrastructure JPA.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public interface BroadcastSecteurRepository {

    /**
     * Retourne tous les secteurs dont le flag actif est vrai.
     *
     * @return liste des secteurs disponibles pour le ciblage
     */
    List<BroadcastSecteur> findAllActifs();
}
