package com.docapost.supervision.interfaces.rest;

import com.docapost.supervision.application.broadcast.AucunLivreurActifException;
import com.docapost.supervision.application.broadcast.BroadcastResultat;
import com.docapost.supervision.application.broadcast.ConsulterSecteursHandler;
import com.docapost.supervision.application.broadcast.EnvoyerBroadcastCommand;
import com.docapost.supervision.application.broadcast.EnvoyerBroadcastHandler;
import com.docapost.supervision.domain.broadcast.BroadcastCiblage;
import com.docapost.supervision.domain.broadcast.TypeBroadcast;
import com.docapost.supervision.domain.broadcast.TypeCiblage;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastCreeDTO;
import com.docapost.supervision.interfaces.dto.broadcast.BroadcastSecteurDTO;
import com.docapost.supervision.interfaces.dto.broadcast.EnvoyerBroadcastRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * BroadcastController — API REST BC-03 / US-067
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
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@RestController
@RequestMapping("/api/supervision")
public class BroadcastController {

    private final EnvoyerBroadcastHandler envoyerBroadcastHandler;
    private final ConsulterSecteursHandler consulterSecteursHandler;

    public BroadcastController(
            EnvoyerBroadcastHandler envoyerBroadcastHandler,
            ConsulterSecteursHandler consulterSecteursHandler) {
        this.envoyerBroadcastHandler = envoyerBroadcastHandler;
        this.consulterSecteursHandler = consulterSecteursHandler;
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
}
