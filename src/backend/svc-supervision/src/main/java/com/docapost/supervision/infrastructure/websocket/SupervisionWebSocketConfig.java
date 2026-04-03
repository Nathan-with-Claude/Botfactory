package com.docapost.supervision.infrastructure.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration WebSocket STOMP pour svc-supervision (US-011).
 *
 * Endpoint : /ws/supervision (SockJS fallback activé)
 * Topic    : /topic/tableau-de-bord (push updates en temps réel)
 * App      : /app (préfixe pour les @MessageMapping)
 *
 * Source : US-011 — "Tableau de bord des tournées en temps réel"
 */
@Configuration
@EnableWebSocketMessageBroker
public class SupervisionWebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Broker simple en mémoire pour les topics
        registry.enableSimpleBroker("/topic");
        // Préfixe pour les messages entrants (@MessageMapping)
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/supervision")
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setSessionCookieNeeded(false); // stateless — pas de JSESSIONID, évite withCredentials côté client
    }
}
