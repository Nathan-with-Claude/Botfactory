package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonJpaRepository;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastStatutLivraisonDTO;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * ConsulterStatutsLectureHandler — Application Service BC-03 / US-069
 *
 * Retourne le détail nominatif des statuts de lecture pour un BroadcastMessage donné.
 * Utilisé par l'endpoint GET /api/supervision/broadcasts/{broadcastMessageId}/statuts.
 *
 * Accès restreint à ROLE_SUPERVISEUR (contrôle au niveau Controller).
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
@Component
public class ConsulterStatutsLectureHandler {

    private final BroadcastStatutLivraisonJpaRepository statutRepo;

    public ConsulterStatutsLectureHandler(BroadcastStatutLivraisonJpaRepository statutRepo) {
        this.statutRepo = statutRepo;
    }

    /**
     * Retourne la liste nominative des statuts pour le broadcast demandé.
     * Triée : VU en premier, puis EN ATTENTE (ENVOYE), par ordre alphabétique du nom.
     *
     * @param query contient le broadcastMessageId
     * @return liste de BroadcastStatutLivraisonDTO
     */
    public List<BroadcastStatutLivraisonDTO> handle(ConsulterStatutsLectureQuery query) {
        return statutRepo.findAllByBroadcastMessageId(query.broadcastMessageId())
                .stream()
                .sorted((a, b) -> {
                    // VU avant ENVOYE, puis par nom
                    int cmpStatut = b.getStatut().compareTo(a.getStatut()); // "VU" > "ENVOYE" lexicalement
                    if (cmpStatut != 0) return cmpStatut;
                    String nomA = a.getNomCompletLivreur() != null ? a.getNomCompletLivreur() : "";
                    String nomB = b.getNomCompletLivreur() != null ? b.getNomCompletLivreur() : "";
                    return nomA.compareTo(nomB);
                })
                .map(s -> new BroadcastStatutLivraisonDTO(
                        s.getLivreurId(),
                        s.getNomCompletLivreur(),
                        s.getStatut(),
                        s.getHorodatageVu()
                ))
                .toList();
    }
}
