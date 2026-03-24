package com.docapost.tournee.interfaces.rest;

import com.docapost.tournee.application.ConsulterPreuveLivraisonHandler;
import com.docapost.tournee.application.ConsulterPreuveLivraisonQuery;
import com.docapost.tournee.application.PreuveNotFoundException;
import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.preuves.model.PreuveLivraison;
import com.docapost.tournee.interfaces.dto.PreuveDetailDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller REST — Preuves de livraison (BC-02 Gestion des Preuves — US-010)
 *
 * US-010 : GET /api/preuves/livraison/{colisId}
 *   - Retourne les métadonnées complètes de la preuve (type, horodatage, coordonnées GPS,
 *     aperçu signature Base64, urlPhoto, hashIntegrite, etc.)
 *   - HTTP 404 si aucune preuve n'est associée au colisId
 *   - HTTP 403 si rôle = LIVREUR (accès refusé — invariant US-010)
 *
 * Accès autorisé : ROLE_SUPERVISEUR, ROLE_SUPPORT
 * Accès refusé   : ROLE_LIVREUR
 */
@RestController
@RequestMapping("/api/preuves")
public class PreuveController {

    private final ConsulterPreuveLivraisonHandler consulterPreuveLivraisonHandler;

    public PreuveController(ConsulterPreuveLivraisonHandler consulterPreuveLivraisonHandler) {
        this.consulterPreuveLivraisonHandler = consulterPreuveLivraisonHandler;
    }

    /**
     * GET /api/preuves/livraison/{colisId}
     * Retourne la preuve de livraison complète pour un colis donné.
     *
     * Codes de retour :
     * - 200 : preuve trouvée, retourne PreuveDetailDTO
     * - 403 : rôle LIVREUR interdit (Spring Security @PreAuthorize)
     * - 404 : aucune preuve pour ce colisId
     *
     * @param colisId identifiant du colis
     * @return PreuveDetailDTO avec toutes les métadonnées de la preuve
     */
    @GetMapping("/livraison/{colisId}")
    @PreAuthorize("hasAnyRole('SUPERVISEUR', 'SUPPORT')")
    public ResponseEntity<PreuveDetailDTO> getPreuveLivraison(@PathVariable String colisId) {
        ConsulterPreuveLivraisonQuery query = new ConsulterPreuveLivraisonQuery(new ColisId(colisId));

        try {
            PreuveLivraison preuve = consulterPreuveLivraisonHandler.handle(query);
            return ResponseEntity.ok(PreuveDetailDTO.from(preuve));
        } catch (PreuveNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
