package com.docapost.supervision.application.broadcast;

import com.docapost.supervision.domain.broadcast.BroadcastCiblage;
import com.docapost.supervision.domain.broadcast.TypeBroadcast;

/**
 * EnvoyerBroadcastCommand — Command DTO BC-03 / US-067
 *
 * Commande d'application pour déclencher l'envoi d'un broadcast.
 * Transmise à {@link EnvoyerBroadcastHandler}.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record EnvoyerBroadcastCommand(
        /** Identifiant du superviseur émetteur */
        String superviseurId,
        /** Nature du message (ALERTE, INFO, CONSIGNE) */
        TypeBroadcast type,
        /** Contenu textuel du message */
        String texte,
        /** Stratégie de ciblage (TOUS ou SECTEUR + codes secteurs) */
        BroadcastCiblage ciblage
) {}
