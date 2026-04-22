package com.docapost.supervision.infrastructure.broadcast;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

/**
 * BroadcastMessageJpaRepository — Spring Data JPA BC-03 / US-067
 *
 * Repository Spring Data pour BroadcastMessageEntity.
 * Méthodes utiles pour US-068 (historique broadcasts) et US-069 (statuts lecture).
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public interface BroadcastMessageJpaRepository
        extends JpaRepository<BroadcastMessageEntity, String> {

    /**
     * Recherche les broadcasts envoyés dans une plage horaire.
     * Utilisé pour l'affichage de l'historique du jour (US-068).
     *
     * @param debut  borne inférieure (inclusive)
     * @param fin    borne supérieure (exclusive)
     * @return liste triée par horodatage croissant
     */
    List<BroadcastMessageEntity> findByHorodatageEnvoiBetween(Instant debut, Instant fin);

    /**
     * Recherche les broadcasts destinés à un livreur donné dans une plage horaire.
     * Utilisé par GET /broadcasts/recus (US-068).
     *
     * @param livreurId  identifiant du livreur destinataire
     * @param debut      borne inférieure (inclusive)
     * @param fin        borne supérieure (exclusive)
     * @return liste des broadcasts contenant livreurId dans leur collection livreurIds
     */
    List<BroadcastMessageEntity> findAllByLivreurIdsContainingAndHorodatageEnvoiBetween(
            String livreurId, Instant debut, Instant fin);
}
