package com.docapost.supervision.domain.broadcast.events;

import com.docapost.supervision.domain.broadcast.TypeBroadcast;

import java.time.Instant;
import java.util.List;

/**
 * BroadcastEnvoye — Domain Event BC-03 / US-067
 *
 * Émis par l'aggregate root {@code BroadcastMessage} lors de la création
 * via la méthode factory {@code BroadcastMessage.envoyer(...)}.
 *
 * Consommé par l'Application Service pour déclencher l'envoi FCM.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
public record BroadcastEnvoye(
        /** Identifiant du BroadcastMessage créé */
        String broadcastMessageId,
        /** Nature du message (ALERTE, INFO, CONSIGNE) */
        TypeBroadcast type,
        /** Contenu textuel du message */
        String texte,
        /** Liste des identifiants livreurs destinataires */
        List<String> livreurIds,
        /** Identifiant du superviseur émetteur */
        String superviseurId,
        /** Horodatage d'envoi (UTC) */
        Instant horodatageEnvoi
) {}
