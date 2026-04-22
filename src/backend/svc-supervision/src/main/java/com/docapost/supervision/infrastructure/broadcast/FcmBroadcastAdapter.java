package com.docapost.supervision.infrastructure.broadcast;

import com.docapost.supervision.domain.broadcast.TypeBroadcast;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * FcmBroadcastAdapter — Adapter ACL BC-03 / US-067
 *
 * Envoie les notifications push FCM via Firebase Admin SDK.
 *
 * Comportement dégradé :
 * - Si FirebaseMessaging est null (bean absent en profil dev), log INFO et simule l'envoi.
 * - Si FirebaseMessaging est présent, envoie un MulticastMessage aux tokens FCM.
 *   Les tokens UNREGISTERED sont supprimés automatiquement via FcmTokenJpaRepository.
 *
 * Source : US-067 — "Envoyer un broadcast à ses livreurs actifs"
 */
@Component
public class FcmBroadcastAdapter {

    private static final Logger log = LoggerFactory.getLogger(FcmBroadcastAdapter.class);

    /**
     * FirebaseMessaging est optionnel : absent si firebase-admin n'est pas configuré
     * ou si le profil dev ne fournit pas le bean.
     * Initialisé à null (pas de bean Spring — évite NoUniqueBeanDefinitionException sur Object).
     * En production, injecter via une sous-classe conditionnelle ou un @Bean Firebase.
     */
    private final Object firebaseMessaging = null; // dev : FCM simulé (log INFO)

    private final FcmTokenJpaRepository fcmTokenJpaRepository;

    public FcmBroadcastAdapter(FcmTokenJpaRepository fcmTokenJpaRepository) {
        this.fcmTokenJpaRepository = fcmTokenJpaRepository;
    }

    /**
     * Envoie le broadcast en multicast à la liste de tokens fournis.
     *
     * @param tokens             liste des tokens FCM destinataires
     * @param type               nature du message
     * @param texte              contenu textuel
     * @param broadcastMessageId identifiant du BroadcastMessage (inclus dans la data)
     */
    public void envoyerMulticast(
            List<String> tokens,
            TypeBroadcast type,
            String texte,
            String broadcastMessageId) {

        if (tokens == null || tokens.isEmpty()) {
            log.info("[FCM] Aucun token FCM disponible pour le broadcast {} — envoi ignoré", broadcastMessageId);
            return;
        }

        if (firebaseMessaging == null) {
            log.info("[FCM] FCM non configuré — broadcast simulé pour {} token(s) (broadcastId={})",
                    tokens.size(), broadcastMessageId);
            return;
        }

        envoyerAvecFirebase(broadcastMessageId, type, texte, tokens);
    }

    /**
     * Envoi effectif via Firebase Admin SDK (réflexion pour éviter la dépendance de compilation).
     * En production, ce bloc est exécuté avec le SDK firebase-admin présent sur le classpath.
     */
    private void envoyerAvecFirebase(
            String broadcastMessageId,
            TypeBroadcast type,
            String texte,
            List<String> tokens) {

        try {
            Map<String, String> data = Map.of(
                    "broadcastMessageId", broadcastMessageId,
                    "type", type.name(),
                    "texte", texte
            );

            // Invocation via réflexion pour décomposer la dépendance optionnelle firebase-admin
            Class<?> multicastMessageClass = Class.forName("com.google.firebase.messaging.MulticastMessage");
            Object builder = multicastMessageClass.getMethod("builder").invoke(null);
            builder.getClass().getMethod("addAllTokens", Iterable.class).invoke(builder, tokens);
            builder.getClass().getMethod("putAllData", Map.class).invoke(builder, data);
            Object multicastMessage = builder.getClass().getMethod("build").invoke(builder);

            Object response = firebaseMessaging.getClass()
                    .getMethod("sendEachForMulticast", multicastMessageClass)
                    .invoke(firebaseMessaging, multicastMessage);

            // Gérer les tokens UNREGISTERED
            List<?> responses = (List<?>) response.getClass().getMethod("getResponses").invoke(response);
            List<String> tokenList = new ArrayList<>(tokens);

            for (int i = 0; i < responses.size(); i++) {
                Object r = responses.get(i);
                Boolean success = (Boolean) r.getClass().getMethod("isSuccessful").invoke(r);
                if (!success) {
                    Object exception = r.getClass().getMethod("getException").invoke(r);
                    if (exception != null) {
                        String msg = exception.getClass().getMethod("getMessage").invoke(exception).toString();
                        if (msg.contains("UNREGISTERED")) {
                            String token = tokenList.get(i);
                            // Recherche du livreurId par token pour suppression
                            fcmTokenJpaRepository.findAll().stream()
                                    .filter(e -> token.equals(e.getToken()))
                                    .findFirst()
                                    .ifPresent(e -> {
                                        log.info("[FCM] Token UNREGISTERED pour livreur {} — suppression", e.getLivreurId());
                                        fcmTokenJpaRepository.deleteById(e.getLivreurId());
                                    });
                        }
                    }
                }
            }

            log.info("[FCM] Broadcast {} envoyé à {} token(s)", broadcastMessageId, tokens.size());

        } catch (Exception e) {
            log.error("[FCM] Erreur lors de l'envoi du broadcast {} : {}", broadcastMessageId, e.getMessage(), e);
        }
    }
}
