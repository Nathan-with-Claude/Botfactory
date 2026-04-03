package com.docapost.supervision.interfaces.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration Spring Security pour svc-supervision.
 *
 * Profil "dev" :
 *   - MockJwtAuthFilter injecte automatiquement superviseur-001 / ROLE_SUPERVISEUR.
 *
 * Profil "prod" (US-020) :
 *   - OAuth2 Resource Server activé — validation JWT Keycloak.
 *   - Le claim "roles" est converti en GrantedAuthority Spring Security.
 *   - Invariant US-020 SC2 : le rôle LIVREUR ne peut PAS accéder aux routes supervision.
 *   - Invariant US-020 SC4 : le rôle DSI peut accéder au module preuves (journalisé).
 *
 * Toutes les routes /api/supervision/** nécessitent ROLE_SUPERVISEUR ou ROLE_DSI.
 * Les WebSockets /ws/** sont permises (authentification gérée côté STOMP si nécessaire).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final MockJwtAuthFilter mockJwtAuthFilter;
    private final Environment environment;

    public SecurityConfig(
            @Autowired(required = false) MockJwtAuthFilter mockJwtAuthFilter,
            Environment environment
    ) {
        this.mockJwtAuthFilter = mockJwtAuthFilter;
        this.environment = environment;
    }

    private boolean isProdProfile() {
        return Arrays.asList(environment.getActiveProfiles()).contains("prod");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()          // WebSocket endpoint
                        // US-020 SC4 : module preuves accessible aux rôles DSI et SUPERVISEUR
                        .requestMatchers("/api/preuves/**").hasAnyRole("SUPERVISEUR", "DSI")
                        // Routes accessibles aux LIVREURS (polling instructions + marquage exécution + prise en compte)
                        .requestMatchers(HttpMethod.GET, "/api/supervision/instructions/en-attente").hasAnyRole("LIVREUR", "SUPERVISEUR")
                        .requestMatchers(HttpMethod.PATCH, "/api/supervision/instructions/*/executer").hasAnyRole("LIVREUR", "SUPERVISEUR")
                        .requestMatchers(HttpMethod.PATCH, "/api/supervision/instructions/*/prendre-en-compte").hasAnyRole("LIVREUR", "SUPERVISEUR")
                        // US-020 SC2 : LIVREUR refusé sur toutes les autres routes supervision (403)
                        .requestMatchers("/api/supervision/**").hasAnyRole("SUPERVISEUR", "DSI")
                        .requestMatchers("/api/planification/**").hasAnyRole("SUPERVISEUR", "DSI")
                        .anyRequest().authenticated()
                );

        if (mockJwtAuthFilter != null) {
            http.addFilterBefore(mockJwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        } else if (isProdProfile()) {
            // Profil prod uniquement : OAuth2 Resource Server — validation JWT Keycloak (US-020)
            http.oauth2ResourceServer(oauth2 -> oauth2
                    .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        }
        // else : profil test / default → pas de filtre JWT, @WithMockUser suffit

        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    /**
     * Convertisseur JWT → GrantedAuthority Spring Security (US-020).
     * Même logique que svc-tournee : claim "roles" → ROLE_xxx.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        converter.setPrincipalClaimName("sub");
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
