package com.docapost.supervision.application.broadcast;

import java.time.Instant;

/**
 * BroadcastResultat — Read Model de résultat BC-03 / US-067
 *
 * Retourné par {@link EnvoyerBroadcastHandler} après un envoi réussi.
 * Traduit ensuite en {@code BroadcastCreeDTO} dans la couche Interface.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record BroadcastResultat(
        /** Identifiant du BroadcastMessage créé */
        String broadcastMessageId,
        /** Nombre de livreurs destinataires effectifs */
        int nombreDestinataires,
        /** Horodatage d'envoi (UTC) */
        Instant horodatageEnvoi
) {}
