package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.infrastructure.broadcast.BroadcastMessageJpaRepository;
import com.docapost.supervision.infrastructure.broadcast.BroadcastStatutLivraisonJpaRepository;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastSummaryDTO;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ConsulterBroadcastsDuJourHandler — Application Service BC-03 / US-069
 *
 * Retourne la liste des BroadcastMessages envoyés dans la journée courante,
 * enrichie des compteurs "Vu par N / M livreurs" depuis la projection.
 *
 * Filtre sur horodatageEnvoi entre début et fin du jour (UTC).
 *
 * Source : US-069 — "Consulter les statuts de lecture des broadcasts"
 */
@Component
public class ConsulterBroadcastsDuJourHandler {

    private final BroadcastMessageJpaRepository broadcastRepo;
    private final BroadcastStatutLivraisonJpaRepository statutRepo;

    public ConsulterBroadcastsDuJourHandler(
            BroadcastMessageJpaRepository broadcastRepo,
            BroadcastStatutLivraisonJpaRepository statutRepo) {
        this.broadcastRepo = broadcastRepo;
        this.statutRepo = statutRepo;
    }

    /**
     * Retourne la liste des broadcasts du jour, du plus récent au plus ancien.
     *
     * @param query contient la date demandée (en général: aujourd'hui)
     * @return liste de BroadcastSummaryDTO avec compteurs
     */
    public List<BroadcastSummaryDTO> handle(ConsulterBroadcastsDuJourQuery query) {
        // Calcul des bornes du jour en UTC
        Instant debutJour = query.date().atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant finJour = query.date().plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        // Récupérer les broadcasts de la journée
        var messages = broadcastRepo.findByHorodatageEnvoiBetween(debutJour, finJour);
        if (messages.isEmpty()) {
            return List.of();
        }

        List<String> ids = messages.stream()
                .map(m -> m.getId())
                .toList();

        // Récupérer tous les statuts en une seule requête (éviter N+1)
        List<Object[]> vuCounts = statutRepo.countVusByBroadcastMessageIds(ids);
        Map<String, Long> nombreVusParId = vuCounts.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        // Nombre total de destinataires par message (depuis la projection)
        var tousStatuts = statutRepo.findAllByBroadcastMessageIdIn(ids);
        Map<String, Long> nombreTotalParId = tousStatuts.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getBroadcastMessageId(),
                        Collectors.counting()
                ));

        // Construire les DTOs — ordre chronologique inverse (plus récent en haut)
        return messages.stream()
                .sorted((a, b) -> b.getHorodatageEnvoi().compareTo(a.getHorodatageEnvoi()))
                .map(m -> new BroadcastSummaryDTO(
                        m.getId(),
                        m.getType(),
                        m.getTexte(),
                        m.getHorodatageEnvoi(),
                        nombreTotalParId.getOrDefault(m.getId(), (long) m.getLivreurIds().size()).intValue(),
                        nombreVusParId.getOrDefault(m.getId(), 0L).intValue()
                ))
                .toList();
    }
}
