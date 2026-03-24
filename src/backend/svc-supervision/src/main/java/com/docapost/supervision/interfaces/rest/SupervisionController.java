package com.docapost.supervision.interfaces.rest;

import com.docapost.supervision.application.ConsulterDetailTourneeHandler;
import com.docapost.supervision.application.ConsulterDetailTourneeQuery;
import com.docapost.supervision.application.ConsulterTableauDeBordHandler;
import com.docapost.supervision.application.ConsulterTableauDeBordQuery;
import com.docapost.supervision.application.TourneeSupervisionNotFoundException;
import com.docapost.supervision.domain.model.StatutTourneeVue;
import com.docapost.supervision.domain.model.TableauDeBord;
import com.docapost.supervision.domain.model.VueTourneeDetail;
import com.docapost.supervision.interfaces.dto.TableauDeBordDTO;
import com.docapost.supervision.interfaces.dto.VueTourneeDetailDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST — Supervision (BC-03 — US-011 + US-012)
 *
 * GET /api/supervision/tableau-de-bord
 *   - Retourne TableauDeBordDTO (liste tournées + compteurs bandeau)
 *   - Filtrable par statut (?statut=A_RISQUE)
 *   - Accès : ROLE_SUPERVISEUR
 *
 * GET /api/supervision/tournees/{tourneeId}
 *   - Retourne VueTourneeDetailDTO (bandeau avancement + colis + incidents)
 *   - 404 si tournée introuvable
 *   - Accès : ROLE_SUPERVISEUR
 *
 * Source : US-011, US-012
 */
@RestController
@RequestMapping("/api/supervision")
public class SupervisionController {

    private final ConsulterTableauDeBordHandler consulterTableauDeBordHandler;
    private final ConsulterDetailTourneeHandler consulterDetailTourneeHandler;

    public SupervisionController(
            ConsulterTableauDeBordHandler consulterTableauDeBordHandler,
            ConsulterDetailTourneeHandler consulterDetailTourneeHandler
    ) {
        this.consulterTableauDeBordHandler = consulterTableauDeBordHandler;
        this.consulterDetailTourneeHandler = consulterDetailTourneeHandler;
    }

    /**
     * GET /api/supervision/tableau-de-bord
     * Retourne le tableau de bord des tournées en cours.
     *
     * @param statut filtre optionnel (EN_COURS, A_RISQUE, CLOTUREE)
     * @return TableauDeBordDTO avec liste + compteurs
     */
    @GetMapping("/tableau-de-bord")
    public ResponseEntity<TableauDeBordDTO> getTableauDeBord(
            @RequestParam(required = false) String statut
    ) {
        StatutTourneeVue filtreStatut = null;
        if (statut != null && !statut.isBlank()) {
            try {
                filtreStatut = StatutTourneeVue.valueOf(statut.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        ConsulterTableauDeBordQuery query = new ConsulterTableauDeBordQuery(filtreStatut);
        TableauDeBord tableau = consulterTableauDeBordHandler.handle(query);
        return ResponseEntity.ok(TableauDeBordDTO.from(tableau));
    }

    /**
     * GET /api/supervision/tournees/{tourneeId}
     * Retourne le détail complet d'une tournée pour le superviseur (US-012 — Ecran W-02).
     *
     * Codes de retour :
     * - 200 : détail trouvé, retourne VueTourneeDetailDTO
     * - 404 : tournée introuvable
     * - 403 : non ROLE_SUPERVISEUR
     *
     * @param tourneeId identifiant de la tournée
     * @return VueTourneeDetailDTO avec bandeau + colis + incidents
     */
    @GetMapping("/tournees/{tourneeId}")
    public ResponseEntity<VueTourneeDetailDTO> getDetailTournee(@PathVariable String tourneeId) {
        try {
            VueTourneeDetail detail = consulterDetailTourneeHandler.handle(
                    new ConsulterDetailTourneeQuery(tourneeId)
            );
            return ResponseEntity.ok(VueTourneeDetailDTO.from(detail));
        } catch (TourneeSupervisionNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
