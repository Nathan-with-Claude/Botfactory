package com.docapost.tournee.interfaces.rest;

import com.docapost.tournee.application.ConsulterListeColisCommand;
import com.docapost.tournee.application.ConsulterListeColisHandler;
import com.docapost.tournee.application.TourneeNotFoundException;
import com.docapost.tournee.domain.model.LivreurId;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.interfaces.dto.TourneeDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/**
 * Controller REST — Tournee (BC-01 Orchestration de Tournee)
 *
 * US-001 : GET /api/tournees/today
 *   - Lit l'identite du livreur depuis le SecurityContext (mock dev ou JWT reel)
 *   - Appelle ConsulterListeColisHandler
 *   - Retourne TourneeDTO
 *
 * Note : l'authentification est assuree par MockJwtAuthFilter (dev)
 * ou par le filtre JWT Keycloak (prod — US-019).
 */
@RestController
@RequestMapping("/api/tournees")
public class TourneeController {

    private final ConsulterListeColisHandler consulterListeColisHandler;

    public TourneeController(ConsulterListeColisHandler consulterListeColisHandler) {
        this.consulterListeColisHandler = consulterListeColisHandler;
    }

    /**
     * GET /api/tournees/today
     * Retourne la tournee du jour pour le livreur authentifie.
     *
     * @param authentication injectee par Spring Security (mock JWT en dev)
     * @return TourneeDTO avec liste des colis, avancement et contraintes
     */
    @GetMapping("/today")
    public ResponseEntity<TourneeDTO> getTourneeAujourdhui(Authentication authentication) {
        String livreurIdStr = authentication.getName();
        LivreurId livreurId = new LivreurId(livreurIdStr);

        ConsulterListeColisCommand command = new ConsulterListeColisCommand(
                livreurId,
                LocalDate.now()
        );

        try {
            Tournee tournee = consulterListeColisHandler.handle(command);
            return ResponseEntity.ok(TourneeDTO.from(tournee));
        } catch (TourneeNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
