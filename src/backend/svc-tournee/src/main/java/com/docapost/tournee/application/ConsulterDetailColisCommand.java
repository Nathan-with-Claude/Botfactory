package com.docapost.tournee.application;

import com.docapost.tournee.domain.model.ColisId;
import com.docapost.tournee.domain.model.TourneeId;

/**
 * Command — Consulter le detail d'un colis (US-004).
 *
 * Transporte l'identifiant de la tournee et l'identifiant du colis cible.
 * Immuable par construction (record Java).
 *
 * Source domaine : BC-01 Orchestration de Tournee.
 */
public record ConsulterDetailColisCommand(
        TourneeId tourneeId,
        ColisId colisId
) {}
