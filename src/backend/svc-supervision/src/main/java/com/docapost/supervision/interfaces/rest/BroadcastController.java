package com.docapost.supervision.interfaces.rest;

import com.docapost.supervision.application.broadcast.AucunLivreurActifException;
import com.docapost.supervision.application.broadcast.BroadcastMessageInconnuException;
import com.docapost.supervision.application.broadcast.BroadcastResultat;
import com.docapost.supervision.application.broadcast.ConsulterBroadcastsDuJourHandler;
import com.docapost.supervision.application.broadcast.ConsulterBroadcastsDuJourQuery;
import com.docapost.supervision.application.broadcast.ConsulterSecteursHandler;
import com.docapost.supervision.application.broadcast.ConsulterStatutsLectureHandler;
import com.docapost.supervision.application.broadcast.ConsulterStatutsLectureQuery;
import com.docapost.supervision.application.broadcast.EnvoyerBroadcastCommand;
import com.docapost.supervision.application.broadcast.EnvoyerBroadcastHandler;
import com.docapost.supervision.application.broadcast.LivreurNonDestinataireException;
import com.docapost.supervision.application.broadcast.MarquerBroadcastVuCommand;
import com.docapost.supervision.application.broadcast.MarquerBroadcastVuHandler;
import com.docapost.supervision.domain.broadcast.BroadcastCiblage;
import com.docapost.supervision.domain.broadcast.TypeBroadcast;
import com.docapost.supervision.domain.broadcast.TypeCiblage;
import com.docapost.supervision.infrastructure.broadcast.BroadcastMessageEntity;
import com.docapost.supervision.infrastructure.broadcast.BroadcastMessageJpaRepository;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastCreeDTO;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastRecuDTO;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastSecteurDTO;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastStatutLivraisonDTO;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastSummaryDTO;
import com.docapost.supervision.interfaces.dto.broadcast.EnvoyerBroadcastRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

/**
 * BroadcastController — API REST BC-03 / US-067 + US-068
 *
 * POST /api/supervision/broadcasts
 *   - Envoie un broadcast aux livreurs actifs
 *   - Retourne 201 Created avec BroadcastCreeDTO
 *   - 422 si aucun livreur actif (AUCUN_LIVREUR_ACTIF)
 *   - 422 si texte invalide (texte vide ou > 280 chars)
 *   - 403 si non ROLE_SUPERVISEUR
 *
 * GET /api/supervision/broadcast-secteurs
 *   - Retourne la liste des secteurs actifs pour le sélecteur de ciblage
 *   - 200 OK avec liste de BroadcastSecteurDTO
 *
 * POST /api/supervision/broadcasts/{broadcastMessageId}/vu
 *   - Marque un broadcast comme vu par le livreur authentifié
 *   - 204 No Content si succès
 *   - 404 si broadcastMessageId inconnu
 *   - 403 si le livreur n'est pas destinataire
 *
 * GET /api/supervision/broadcasts/recus
 *   - Retourne la liste des broadcasts reçus par le livreur pour la date donnée
 *   - 200 OK avec liste de BroadcastRecuDTO
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 *          US-068 — "Recevoir et consulter les messages broadcast sur l'application mobile"
 *          US-069 — "Consulter les statuts de lecture des broadcasts"
 */
@RestController
@RequestMapping("/api/supervision")
public class BroadcastController {

    private final EnvoyerBroadcastHandler envoyerBroadcastHandler;
    private final ConsulterSecteursHandler consulterSecteursHandler;
    private final MarquerBroadcastVuHandler marquerBroadcastVuHandler;
    private final BroadcastMessageJpaRepository broadcastMessageJpaRepository;
    private final ConsulterBroadcastsDuJourHandler consulterBroadcastsDuJourHandler;
    private final ConsulterStatutsLectureHandler consulterStatutsLectureHandler;

    public BroadcastController(
            EnvoyerBroadcastHandler envoyerBroadcastHandler,
            ConsulterSecteursHandler consulterSecteursHandler,
            MarquerBroadcastVuHandler marquerBroadcastVuHandler,
            BroadcastMessageJpaRepository broadcastMessageJpaRepository,
            ConsulterBroadcastsDuJourHandler consulterBroadcastsDuJourHandler,
            ConsulterStatutsLectureHandler consulterStatutsLectureHandler) {
        this.envoyerBroadcastHandler = envoyerBroadcastHandler;
        this.consulterSecteursHandler = consulterSecteursHandler;
        this.marquerBroadcastVuHandler = marquerBroadcastVuHandler;
        this.broadcastMessageJpaRepository = broadcastMessageJpaRepository;
        this.consulterBroadcastsDuJourHandler = consulterBroadcastsDuJourHandler;
        this.consulterStatutsLectureHandler = consulterStatutsLectureHandler;
    }

    /**
     * POST /api/supervision/broadcasts
     *
     * Envoie un broadcast push aux livreurs actifs.
     * Le superviseurId est extrait du token JWT (Authentication.getName()).
     *
     * @param request corps de la requête
     * @param auth    contexte de sécurité Spring Security
     * @return 201 Created avec BroadcastCreeDTO, ou 422 si invariant métier non respecté
     */
    @PostMapping("/broadcasts")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public ResponseEntity<?> envoyerBroadcast(
            @RequestBody EnvoyerBroadcastRequest request,
            Authentication auth) {

        try {
            String superviseurId = auth.getName();

            BroadcastCiblage ciblage = new BroadcastCiblage(
                    TypeCiblage.valueOf(request.ciblage().type()),
                    request.ciblage().secteurs() != null ? request.ciblage().secteurs() : List.of()
            );

            EnvoyerBroadcastCommand command = new EnvoyerBroadcastCommand(
                    superviseurId,
                    TypeBroadcast.valueOf(request.type()),
                    request.texte(),
                    ciblage
            );

            BroadcastResultat resultat = envoyerBroadcastHandler.handle(command);

            BroadcastCreeDTO dto = new BroadcastCreeDTO(
                    resultat.broadcastMessageId(),
                    resultat.nombreDestinataires(),
                    resultat.horodatageEnvoi()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(dto);

        } catch (AucunLivreurActifException e) {
            return ResponseEntity.unprocessableEntity()
                    .body(Map.of("code", "AUCUN_LIVREUR_ACTIF", "message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.unprocessableEntity()
                    .body(Map.of("code", "VALIDATION_ERROR", "message", e.getMessage()));
        }
    }

    /**
     * GET /api/supervision/broadcast-secteurs
     *
     * Retourne la liste des secteurs actifs disponibles pour le ciblage.
     *
     * @return 200 OK avec liste de BroadcastSecteurDTO
     */
    @GetMapping("/broadcast-secteurs")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public ResponseEntity<List<BroadcastSecteurDTO>> consulterSecteurs() {
        List<BroadcastSecteurDTO> dtos = consulterSecteursHandler.handle().stream()
                .map(s -> new BroadcastSecteurDTO(s.codeSecteur(), s.libelle()))
                .toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * POST /api/supervision/broadcasts/{broadcastMessageId}/vu
     *
     * Marque un broadcast comme vu par le livreur authentifié.
     * Idempotent : appeler plusieurs fois ne provoque pas d'erreur.
     *
     * @param broadcastMessageId identifiant du broadcast à acquitter
     * @param auth               contexte de sécurité (livreurId = auth.getName())
     * @return 204 No Content, 404 si message inconnu, 403 si non destinataire
     */
    @PostMapping("/broadcasts/{broadcastMessageId}/vu")
    @PreAuthorize("hasRole('LIVREUR')")
    public ResponseEntity<Void> marquerVu(
            @PathVariable String broadcastMessageId,
            Authentication auth) {

        try {
            String livreurId = auth.getName();
            marquerBroadcastVuHandler.handle(
                    new MarquerBroadcastVuCommand(broadcastMessageId, livreurId));
            return ResponseEntity.noContent().build();
        } catch (BroadcastMessageInconnuException e) {
            return ResponseEntity.notFound().build();
        } catch (LivreurNonDestinataireException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    /**
     * GET /api/supervision/broadcasts/recus
     *
     * Retourne la liste des broadcasts reçus par le livreur authentifié pour la date donnée.
     * Tri chronologique inverse (plus récent en premier).
     *
     * Le champ {@code vu} est false par défaut à ce stade.
     * US-069 enrichira ce champ avec le read model BroadcastStatutLivraison.
     *
     * @param date format ISO yyyy-MM-dd (ex : "2026-04-21")
     * @param auth contexte de sécurité (livreurId = auth.getName())
     * @return 200 OK avec liste de BroadcastRecuDTO
     */
    @GetMapping("/broadcasts/recus")
    @PreAuthorize("hasRole('LIVREUR')")
    public ResponseEntity<List<BroadcastRecuDTO>> consulterRecus(
            @RequestParam String date,
            Authentication auth) {

        String livreurId = auth.getName();
        LocalDate localDate = LocalDate.parse(date);
        Instant debut = localDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant fin = localDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<BroadcastRecuDTO> dtos = broadcastMessageJpaRepository
                .findAllByLivreurIdsContainingAndHorodatageEnvoiBetween(livreurId, debut, fin)
                .stream()
                .sorted((a, b) -> b.getHorodatageEnvoi().compareTo(a.getHorodatageEnvoi()))
                .map(entity -> new BroadcastRecuDTO(
                        entity.getId(),
                        entity.getType(),
                        entity.getTexte(),
                        entity.getSuperviseurId(),
                        entity.getHorodatageEnvoi(),
                        false // US-069 enrichira avec le statut de lecture réel
                ))
                .toList();

        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/supervision/broadcasts/du-jour?date=YYYY-MM-DD
     *
     * Retourne la liste des broadcasts envoyés dans la journée, du plus récent au plus ancien.
     * Chaque item inclut les compteurs "Vu par N / M livreurs" depuis la projection.
     *
     * @param date date du jour au format YYYY-MM-DD (ex : "2026-04-21")
     * @return 200 OK avec liste de BroadcastSummaryDTO
     */
    @GetMapping("/broadcasts/du-jour")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public ResponseEntity<List<BroadcastSummaryDTO>> consulterBroadcastsDuJour(
            @RequestParam String date) {

        LocalDate localDate = LocalDate.parse(date);
        List<BroadcastSummaryDTO> dtos = consulterBroadcastsDuJourHandler
                .handle(new ConsulterBroadcastsDuJourQuery(localDate));
        return ResponseEntity.ok(dtos);
    }

    /**
     * GET /api/supervision/broadcasts/{broadcastMessageId}/statuts
     *
     * Retourne le détail nominatif des statuts de lecture pour un broadcast donné.
     * VU avec horodatage ou EN ATTENTE (ENVOYE) par livreur.
     * Accès restreint au rôle SUPERVISEUR (ENF-BROADCAST-006).
     *
     * @param broadcastMessageId identifiant du BroadcastMessage
     * @return 200 OK avec liste de BroadcastStatutLivraisonDTO
     */
    @GetMapping("/broadcasts/{broadcastMessageId}/statuts")
    @PreAuthorize("hasRole('SUPERVISEUR')")
    public ResponseEntity<List<BroadcastStatutLivraisonDTO>> consulterStatutsLecture(
            @PathVariable String broadcastMessageId) {

        List<BroadcastStatutLivraisonDTO> dtos = consulterStatutsLectureHandler
                .handle(new ConsulterStatutsLectureQuery(broadcastMessageId));
        return ResponseEntity.ok(dtos);
    }
}
