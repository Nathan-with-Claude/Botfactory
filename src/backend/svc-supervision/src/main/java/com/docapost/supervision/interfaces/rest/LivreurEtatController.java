package com.docapost.supervision.interfaces.rest;

import com.docapost.supervision.application.planification.ConsulterEtatLivreursHandler;
import com.docapost.supervision.interfaces.dto.LivreurEtatDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * LivreurEtatController — REST Controller BC-07 / US-066
 *
 * Expose l'état journalier de tous les livreurs du référentiel.
 * Accès restreint aux rôles SUPERVISEUR et DSI.
 *
 * Source : US-066
 */
@RestController
@RequestMapping("/api/supervision/livreurs")
public class LivreurEtatController {

    private final ConsulterEtatLivreursHandler handler;

    public LivreurEtatController(ConsulterEtatLivreursHandler handler) {
        this.handler = handler;
    }

    /**
     * GET /api/supervision/livreurs/etat-du-jour?date=yyyy-MM-dd
     *
     * Retourne la liste de tous les livreurs du référentiel avec leur état du jour.
     * Si le paramètre date est absent, utilise la date du jour côté serveur.
     *
     * @param date date optionnelle au format ISO (yyyy-MM-dd)
     * @return HTTP 200 avec la liste des LivreurEtatDTO
     */
    @GetMapping("/etat-du-jour")
    @PreAuthorize("hasAnyRole('SUPERVISEUR', 'DSI')")
    public ResponseEntity<List<LivreurEtatDTO>> getEtatDuJour(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        LocalDate dateEffective = (date != null) ? date : LocalDate.now();
        List<LivreurEtatDTO> dtos = handler.handle(dateEffective).stream()
                .map(LivreurEtatDTO::fromDomain)
                .toList();
        return ResponseEntity.ok(dtos);
    }
}
