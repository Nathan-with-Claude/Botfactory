package com.docapost.oms.application;

import com.docapost.oms.domain.model.EvenementLivraison;

/**
 * Port (interface) — ACL vers l'OMS externe (US-017).
 *
 * Le BC-05 est un Anti-Corruption Layer : il traduit les événements DocuPost
 * en requêtes normalisées vers l'API REST de l'OMS, sans exposer la logique
 * interne de l'OMS à BC-01.
 *
 * L'implémentation concrète (OmsApiClient) se trouve dans infrastructure/oms/.
 */
public interface OmsApiPort {

    /**
     * Transmet un événement normalisé à l'OMS.
     *
     * @return true si la transmission a réussi, false si l'OMS a refusé ou est indisponible.
     */
    boolean transmettre(EvenementLivraison evenement);
}
