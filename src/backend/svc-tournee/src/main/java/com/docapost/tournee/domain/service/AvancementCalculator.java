package com.docapost.tournee.domain.service;

import com.docapost.tournee.domain.model.Avancement;
import com.docapost.tournee.domain.model.Tournee;

/**
 * Domain Service — AvancementCalculator (BC-01 Orchestration de Tournee)
 *
 * Calcule le Value Object Avancement a partir de l'etat courant d'une Tournee.
 *
 * Responsabilite : calculer le nombre de colis restants (resteALivrer) et
 * une estimation de l'heure de fin de tournee.
 *
 * Regles metier (US-002) :
 * - resteALivrer = nombre de colis dont le statut est A_LIVRER uniquement.
 *   Les colis LIVRE, ECHEC et A_REPRESENTER sont consideres "traites" et
 *   ne font PAS partie du reste a livrer.
 * - estimationFin : approximation non contractuelle. Dans le MVP, retourne null
 *   si aucun colis n'est encore traite (cadence inconnue). Fonctionnalite
 *   d'estimation fine a implementer dans une iteration future via la cadence
 *   moyenne constatee sur la journee.
 *
 * Ce service est un Domain Service (pas de Spring — pur Java) : il encapsule
 * une logique transversale qui ne peut pas appartenir a un seul Aggregate.
 *
 * Source : US-002 — invariant "L'Avancement est un Value Object calcule a
 * partir de l'etat courant de la Tournee."
 */
public class AvancementCalculator {

    /**
     * Calcule l'Avancement courant de la Tournee.
     *
     * @param tournee l'aggregate Tournee dont on calcule l'avancement
     * @return Avancement (Value Object immuable)
     */
    public Avancement calculer(Tournee tournee) {
        long colisTraites = tournee.getColis().stream()
                .filter(c -> c.estTraite())
                .count();

        int total = tournee.getColis().size();

        return new Avancement(
                (int) colisTraites,
                total,
                null  // MVP : estimation de fin non calculee (cadence non disponible)
        );
    }
}
