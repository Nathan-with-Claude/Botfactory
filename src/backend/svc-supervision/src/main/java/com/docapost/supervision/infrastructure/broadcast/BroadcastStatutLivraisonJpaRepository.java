package com.docapost.supervision.infrastructure.broadcast;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * BroadcastStatutLivraisonJpaRepository — Spring Data JPA BC-03 / US-069
 *
 * Repository pour le read model broadcast_statut_livraison.
 * Utilisé pour les compteurs "Vu par N / M livreurs" et le détail nominatif.
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
public interface BroadcastStatutLivraisonJpaRepository
        extends JpaRepository<BroadcastStatutLivraisonEntity, Long> {

    /**
     * Retourne tous les statuts de lecture pour un broadcast donné.
     * Utilisé pour le détail nominatif (endpoint /statuts).
     */
    List<BroadcastStatutLivraisonEntity> findAllByBroadcastMessageId(String broadcastMessageId);

    /**
     * Retourne le statut d'un livreur pour un broadcast donné.
     * Utilisé par BroadcastVuEventHandler pour la transition ENVOYE → VU.
     */
    Optional<BroadcastStatutLivraisonEntity> findByBroadcastMessageIdAndLivreurId(
            String broadcastMessageId, String livreurId);

    /**
     * Retourne tous les statuts pour une liste de broadcastMessageIds.
     * Utilisé pour calculer les compteurs "Vu par N / M" de l'historique du jour.
     */
    List<BroadcastStatutLivraisonEntity> findAllByBroadcastMessageIdIn(
            List<String> broadcastMessageIds);

    /**
     * Compte les statuts VU groupés par broadcastMessageId.
     * Retourne des Object[] : [broadcastMessageId (String), count (Long)]
     * Utilisé pour enrichir la liste du jour avec les compteurs sans N+1.
     */
    @Query("""
            SELECT b.broadcastMessageId, COUNT(b)
            FROM BroadcastStatutLivraisonEntity b
            WHERE b.statut = 'VU'
              AND b.broadcastMessageId IN :ids
            GROUP BY b.broadcastMessageId
            """)
    List<Object[]> countVusByBroadcastMessageIds(@Param("ids") List<String> ids);
}
