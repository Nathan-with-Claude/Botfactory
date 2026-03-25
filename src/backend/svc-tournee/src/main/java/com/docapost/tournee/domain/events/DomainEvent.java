package com.docapost.tournee.domain.events;

import java.time.Instant;

/**
 * Interface marqueur pour tous les Domain Events du BC Orchestration de Tournee.
 * Un Domain Event est un fait passe immuable.
 *
 * Source : "Les evenements de livraison doivent etre historises (qui/quoi/quand)." (Mme Dubois)
 */
public interface DomainEvent {
    Instant horodatage();
}
