package com.docapost.tournee.interfaces.rest;

import com.docapost.tournee.application.CloturerTourneeCommand;
import com.docapost.tournee.application.CloturerTourneeHandler;
import com.docapost.tournee.application.ColisNotFoundException;
import com.docapost.tournee.application.ConfirmerLivraisonCommand;
import com.docapost.tournee.application.ConfirmerLivraisonHandler;
import com.docapost.tournee.application.ConsulterDetailColisCommand;
import com.docapost.tournee.application.ConsulterDetailColisHandler;
import com.docapost.tournee.application.ConsulterListeColisCommand;
import com.docapost.tournee.application.ConsulterListeColisHandler;
import com.docapost.tournee.application.DeclarerEchecLivraisonCommand;
import com.docapost.tournee.application.DeclarerEchecLivraisonHandler;
import com.docapost.tournee.application.RecapitulatifTourneeResult;
import com.docapost.tournee.application.TourneeNotFoundException;
import com.docapost.tournee.domain.model.Colis;
import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.LivreurId;
import com.docapost.tournee.domain.model.Tournee;
import com.docapost.tournee.domain.model.TourneeId;
import com.docapost.tournee.domain.model.TourneeInvariantException;
import com.docapost.tournee.domain.preuves.model.Coordonnees;
import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.docapost.tournee.domain.preuves.model.PreuveLivraisonInvariantException;
import com.docapost.tournee.interfaces.dto.ColisDTO;
import com.docapost.tournee.interfaces.dto.ConfirmerLivraisonRequest;
import com.docapost.tournee.interfaces.dto.DeclarerEchecRequest;
import com.docapost.tournee.interfaces.dto.PreuveLivraisonDTO;
import com.docapost.tournee.interfaces.dto.RecapitulatifTourneeDTO;
import com.docapost.tournee.infrastructure.supervision.SupervisionNotifier;
import com.docapost.tournee.interfaces.dto.TourneeDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
 * US-004 : GET /api/tournees/{tourneeId}/colis/{colisId}
 *   - Retourne le detail complet d'un colis (adresse, destinataire, contraintes, statut)
 *   - 404 si tournee ou colis introuvable
 *
 * US-005 : POST /api/tournees/{tourneeId}/colis/{colisId}/echec
 *   - Declare un echec de livraison avec motif normalise et disposition
 *   - 200 si succes, 404 si tournee ou colis introuvable, 409 si transition interdite
 *   - Emet EchecLivraisonDeclare (Domain Event)
 *
 * US-007 : POST /api/tournees/{tourneeId}/cloture
 *   - Cloture la tournee si tous les colis ont un statut terminal
 *   - 200 avec RecapitulatifTourneeDTO si succes
 *   - 404 si tournee introuvable
 *   - 409 si des colis sont encore au statut "a livrer"
 *   - Emet TourneeCloturee (Domain Event)
 *
 * Note : l'authentification est assuree par MockJwtAuthFilter (dev)
 * ou par le filtre JWT Keycloak (prod — US-019).
 */
@RestController
@RequestMapping("/api/tournees")
public class TourneeController {

    private final ConsulterListeColisHandler consulterListeColisHandler;
    private final ConsulterDetailColisHandler consulterDetailColisHandler;
    private final DeclarerEchecLivraisonHandler declarerEchecLivraisonHandler;
    private final CloturerTourneeHandler cloturerTourneeHandler;
    private final ConfirmerLivraisonHandler confirmerLivraisonHandler;
    private final SupervisionNotifier supervisionNotifier;

    public TourneeController(
            ConsulterListeColisHandler consulterListeColisHandler,
            ConsulterDetailColisHandler consulterDetailColisHandler,
            DeclarerEchecLivraisonHandler declarerEchecLivraisonHandler,
            CloturerTourneeHandler cloturerTourneeHandler,
            ConfirmerLivraisonHandler confirmerLivraisonHandler,
            SupervisionNotifier supervisionNotifier
    ) {
        this.consulterListeColisHandler = consulterListeColisHandler;
        this.consulterDetailColisHandler = consulterDetailColisHandler;
        this.declarerEchecLivraisonHandler = declarerEchecLivraisonHandler;
        this.cloturerTourneeHandler = cloturerTourneeHandler;
        this.confirmerLivraisonHandler = confirmerLivraisonHandler;
        this.supervisionNotifier = supervisionNotifier;
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

    /**
     * GET /api/tournees/{tourneeId}/colis/{colisId}
     * Retourne le detail complet d'un colis (US-004 — Ecran M-03).
     *
     * Invariants preserves :
     * - 404 si la tournee n'existe pas
     * - 404 si le colis n'appartient pas a cette tournee
     * - Le numero de telephone du destinataire est transmis pour l'appel direct
     *   (masquage cote frontend, conformite RGPD)
     *
     * @param tourneeId identifiant de la tournee
     * @param colisId   identifiant du colis
     * @return ColisDTO avec toutes les informations du colis
     */
    @GetMapping("/{tourneeId}/colis/{colisId}")
    public ResponseEntity<ColisDTO> getDetailColis(
            @PathVariable String tourneeId,
            @PathVariable String colisId
    ) {
        ConsulterDetailColisCommand command = new ConsulterDetailColisCommand(
                new TourneeId(tourneeId),
                new ColisId(colisId)
        );

        try {
            Colis colis = consulterDetailColisHandler.handle(command);
            return ResponseEntity.ok(ColisDTO.from(colis));
        } catch (TourneeNotFoundException | ColisNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/tournees/{tourneeId}/colis/{colisId}/echec
     * Declare un echec de livraison (US-005 — Ecran M-05).
     *
     * Corps de requete : { "motif": "ABSENT", "disposition": "A_REPRESENTER", "noteLibre": "..." }
     *
     * Codes de retour :
     * - 200 : echec declare, retourne le ColisDTO mis a jour (statut = ECHEC)
     * - 404 : tournee ou colis introuvable
     * - 409 : transition de statut interdite (colis deja en ECHEC ou LIVRE)
     * - 401 : non authentifie
     *
     * @param tourneeId identifiant de la tournee
     * @param colisId   identifiant du colis
     * @param request   body contenant motif, disposition et noteLibre optionnelle
     * @return ColisDTO avec statut ECHEC, motif et disposition
     */
    @PostMapping("/{tourneeId}/colis/{colisId}/echec")
    public ResponseEntity<ColisDTO> declarerEchecLivraison(
            @PathVariable String tourneeId,
            @PathVariable String colisId,
            @RequestBody DeclarerEchecRequest request,
            Authentication authentication
    ) {
        DeclarerEchecLivraisonCommand command = new DeclarerEchecLivraisonCommand(
                new TourneeId(tourneeId),
                new ColisId(colisId),
                request.motif(),
                request.disposition(),
                request.noteLibre()
        );

        try {
            Colis colis = declarerEchecLivraisonHandler.handle(command);
            // US-032 — Notifier svc-supervision avec le vrai livreurId (Bloquant 1)
            String livreurId = authentication != null ? authentication.getName() : "inconnu";
            supervisionNotifier.notifierAsync("ECHEC_DECLAREE", tourneeId, livreurId, colisId);
            return ResponseEntity.ok(ColisDTO.from(colis));
        } catch (TourneeNotFoundException | ColisNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (TourneeInvariantException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * POST /api/tournees/{tourneeId}/colis/{colisId}/livraison
     * Confirme la livraison d'un colis avec capture de la preuve (US-008 + US-009 — Ecran M-04).
     *
     * Corps de requete : { "typePreuve": "SIGNATURE|PHOTO|TIERS_IDENTIFIE|DEPOT_SECURISE",
     *                      "coordonneesGps": {"latitude": ..., "longitude": ...}, // optionnel
     *                      "donneesSignature": "...", // si SIGNATURE
     *                      "urlPhoto": "...", "hashIntegrite": "...", // si PHOTO
     *                      "nomTiers": "...", // si TIERS_IDENTIFIE
     *                      "descriptionDepot": "..." // si DEPOT_SECURISE
     *                    }
     *
     * Codes de retour :
     * - 200 : livraison confirmee, retourne PreuveLivraisonDTO
     * - 400 : donnees de preuve invalides (signature vide, nom tiers absent, etc.)
     * - 404 : tournee ou colis introuvable
     * - 409 : transition de statut interdite (colis deja livre ou en echec)
     *
     * @param tourneeId identifiant de la tournee
     * @param colisId   identifiant du colis
     * @param request   body contenant typePreuve et donnees associees
     * @return PreuveLivraisonDTO avec l'identifiant de la preuve cree
     */
    @PostMapping("/{tourneeId}/colis/{colisId}/livraison")
    public ResponseEntity<PreuveLivraisonDTO> confirmerLivraison(
            @PathVariable String tourneeId,
            @PathVariable String colisId,
            @RequestBody ConfirmerLivraisonRequest request,
            Authentication authentication
    ) {
        try {
            Coordonnees coordonnees = null;
            if (request.coordonneesGps() != null) {
                coordonnees = new Coordonnees(
                        request.coordonneesGps().latitude(),
                        request.coordonneesGps().longitude()
                );
            }

            ConfirmerLivraisonCommand command = switch (request.typePreuve()) {
                case "SIGNATURE" -> ConfirmerLivraisonCommand.pourSignature(
                        new TourneeId(tourneeId), new ColisId(colisId),
                        request.donneesSignature() != null ? request.donneesSignature().getBytes() : null,
                        coordonnees
                );
                case "PHOTO" -> ConfirmerLivraisonCommand.pourPhoto(
                        new TourneeId(tourneeId), new ColisId(colisId),
                        request.urlPhoto(), request.hashIntegrite(), coordonnees
                );
                case "TIERS_IDENTIFIE" -> ConfirmerLivraisonCommand.pourTiers(
                        new TourneeId(tourneeId), new ColisId(colisId),
                        request.nomTiers(), coordonnees
                );
                case "DEPOT_SECURISE" -> ConfirmerLivraisonCommand.pourDepotSecurise(
                        new TourneeId(tourneeId), new ColisId(colisId),
                        request.descriptionDepot(), coordonnees
                );
                default -> throw new IllegalArgumentException("Type de preuve inconnu : " + request.typePreuve());
            };

            PreuveLivraison preuve = confirmerLivraisonHandler.handle(command);
            // US-032 — Notifier svc-supervision avec le vrai livreurId (Bloquant 1)
            String livreurId = authentication != null ? authentication.getName() : "inconnu";
            supervisionNotifier.notifierAsync("COLIS_LIVRE", tourneeId, livreurId, colisId);
            return ResponseEntity.ok(PreuveLivraisonDTO.from(preuve));
        } catch (TourneeNotFoundException | ColisNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (TourneeInvariantException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (PreuveLivraisonInvariantException | IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/tournees/{tourneeId}/cloture
     * Cloture la tournee du livreur (US-007 — Ecran M-07 recapitulatif).
     *
     * Invariants preserves :
     * - 200 : tournee cloturee, retourne RecapitulatifTourneeDTO
     * - 404 : tournee introuvable
     * - 409 : au moins un colis est encore au statut "a livrer"
     *
     * @param tourneeId identifiant de la tournee a cloturer
     * @return RecapitulatifTourneeDTO avec les compteurs de livraison
     */
    @PostMapping("/{tourneeId}/cloture")
    public ResponseEntity<RecapitulatifTourneeDTO> cloturerTournee(
            @PathVariable String tourneeId,
            Authentication authentication
    ) {
        CloturerTourneeCommand command = new CloturerTourneeCommand(new TourneeId(tourneeId));

        try {
            RecapitulatifTourneeResult recap = cloturerTourneeHandler.handle(command);
            // US-032 — Notifier svc-supervision avec le vrai livreurId (Bloquant 1)
            String livreurId = authentication != null ? authentication.getName() : "inconnu";
            supervisionNotifier.notifierAsync("TOURNEE_CLOTUREE", tourneeId, livreurId, null);
            return ResponseEntity.ok(RecapitulatifTourneeDTO.from(recap));
        } catch (TourneeNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (TourneeInvariantException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}
