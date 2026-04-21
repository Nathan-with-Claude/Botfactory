package com.docapost.supervision.domain.broadcast.repository;

import java.util.List;
import java.util.Map;

/**
 * FcmTokenRepository — Port (interface domaine) BC-03 / US-067
 *
 * Contrat d'accès aux tokens FCM des livreurs.
 * L'implémentation concrète se trouve dans l'infrastructure JPA.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public interface FcmTokenRepository {

    /**
     * Retourne la map livreurId → token FCM pour les livreurs donnés.
     * Les livreurs sans token enregistré sont absents de la map retournée.
     *
     * @param livreurIds liste des identifiants livreurs
     * @return map livreurId → token FCM
     */
    Map<String, String> findTokensByLivreurIds(List<String> livreurIds);
}
