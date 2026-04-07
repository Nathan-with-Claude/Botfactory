package com.docapost.supervision.infrastructure.websocket;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires — SupervisionWebSocketConfig (US-057)
 *
 * Vérifie que la configuration STOMP est correctement déclarée :
 * - Simple broker sur /topic
 * - Préfixe applicatif /app
 * - Endpoint /ws/supervision avec SockJS activé
 */
class SupervisionWebSocketConfigTest {

    private final SupervisionWebSocketConfig config = new SupervisionWebSocketConfig();

    // ─── SC1 : Message broker ────────────────────────────────────────────────

    @Test
    @DisplayName("SC1 - configureMessageBroker active le simple broker sur /topic")
    void configureMessageBroker_active_simple_broker_sur_topic() {
        MessageBrokerRegistry registry = mock(MessageBrokerRegistry.class);
        when(registry.enableSimpleBroker(any(String[].class))).thenReturn(null);
        when(registry.setApplicationDestinationPrefixes(any(String[].class))).thenReturn(registry);

        config.configureMessageBroker(registry);

        verify(registry).enableSimpleBroker("/topic");
    }

    @Test
    @DisplayName("SC2 - configureMessageBroker définit le préfixe applicatif /app")
    void configureMessageBroker_definit_prefixe_app() {
        MessageBrokerRegistry registry = mock(MessageBrokerRegistry.class);
        when(registry.enableSimpleBroker(any(String[].class))).thenReturn(null);
        when(registry.setApplicationDestinationPrefixes(any(String[].class))).thenReturn(registry);

        config.configureMessageBroker(registry);

        verify(registry).setApplicationDestinationPrefixes("/app");
    }

    // ─── SC3 : Enregistrement endpoint STOMP ────────────────────────────────

    @Test
    @DisplayName("SC3 - registerStompEndpoints enregistre /ws/supervision")
    void registerStompEndpoints_enregistre_ws_supervision() {
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration registration = mock(StompWebSocketEndpointRegistration.class);
        when(registry.addEndpoint("/ws/supervision")).thenReturn(registration);
        when(registration.setAllowedOriginPatterns(any(String[].class))).thenReturn(registration);
        when(registration.withSockJS()).thenReturn(mock(org.springframework.web.socket.config.annotation.SockJsServiceRegistration.class));

        config.registerStompEndpoints(registry);

        verify(registry).addEndpoint("/ws/supervision");
    }

    @Test
    @DisplayName("SC4 - registerStompEndpoints autorise toutes les origines (SockJS)")
    void registerStompEndpoints_autorise_toutes_origines() {
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration registration = mock(StompWebSocketEndpointRegistration.class);
        when(registry.addEndpoint(any(String.class))).thenReturn(registration);
        when(registration.setAllowedOriginPatterns(any(String[].class))).thenReturn(registration);
        when(registration.withSockJS()).thenReturn(mock(org.springframework.web.socket.config.annotation.SockJsServiceRegistration.class));

        config.registerStompEndpoints(registry);

        verify(registration).setAllowedOriginPatterns("*");
    }
}
