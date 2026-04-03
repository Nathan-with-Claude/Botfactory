package com.docapost.tournee.interfaces.security;

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
 * Configuration Spring Security pour svc-tournee.
 *
 * Profil "dev" :
 *   - MockJwtAuthFilter injecte automatiquement livreur-001 / ROLE_LIVREUR.
 *   - Aucune validation de token JWT réelle.
 *
 * Profil "prod" (US-019 / US-020) :
 *   - OAuth2 Resource Server activé.
 *   - Les tokens JWT sont validés via le JWKS endpoint du SSO corporate Keycloak.
 *   - Le claim "roles" est converti en GrantedAuthority Spring Security.
 *   - URL du issuer configurable via la propriété docupost.sso.issuer-uri.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final MockJwtAuthFilter mockJwtAuthFilter;
    private final Environment environment;

    /**
     * Injection optionnelle du MockJwtAuthFilter.
     * En prod (@Profile != "dev"), MockJwtAuthFilter n'existe pas.
     * Spring injectera null. Le filtre n'est pas ajoute a la chaine dans ce cas.
     *
     * L'Environment permet de détecter si on est en profil "prod"
     * pour activer la validation OAuth2 Resource Server.
     */
    public SecurityConfig(
            @org.springframework.beans.factory.annotation.Autowired(required = false)
            MockJwtAuthFilter mockJwtAuthFilter,
            Environment environment
    ) {
        this.mockJwtAuthFilter = mockJwtAuthFilter;
        this.environment = environment;
    }

    /** Retourne true uniquement si le profil "prod" est actif (pas dev, pas test) */
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
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // preflight CORS
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()  // dev uniquement
                        // US-010 : accès aux preuves restreint aux rôles support/superviseur
                        .requestMatchers("/api/preuves/**")
                            .hasAnyRole("SUPERVISEUR", "SUPPORT")
                        // US-019/020 : SC3 — les livreurs ne peuvent pas accéder aux endpoints superviseur
                        .requestMatchers("/api/supervision/**").hasAnyRole("SUPERVISEUR", "DSI")
                        .anyRequest().authenticated()
                );

        if (mockJwtAuthFilter != null) {
            // Profil dev : MockJwtAuthFilter injecte une identité fictive
            http.addFilterBefore(mockJwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        } else if (isProdProfile()) {
            // Profil prod uniquement : OAuth2 Resource Server — validation JWT Keycloak (US-019/020)
            // En test (@WebMvcTest), @WithMockUser gère l'authentification → pas besoin du JwtDecoder.
            http.oauth2ResourceServer(oauth2 -> oauth2
                    .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );
        }
        // else : profil test / default → pas de filtre JWT, @WithMockUser suffit

        // Autorise les frames H2 console en dev
        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    /**
     * Convertisseur JWT → GrantedAuthority Spring Security (US-019/020).
     *
     * Le SSO Keycloak place les rôles dans le claim "roles" (liste de strings).
     * Spring Security les préfixe automatiquement avec "ROLE_".
     *
     * Exemple de payload JWT :
     *   { "sub": "livreur-042", "roles": ["LIVREUR"] }
     *   → GrantedAuthority : ROLE_LIVREUR
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("roles");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        // Le claim "sub" est utilisé comme principal name (livreurId)
        converter.setPrincipalClaimName("sub");
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:8082",  // svc-supervision dev
                "http://localhost:3000",  // frontend web supervision dev
                "http://localhost:8083",  // expo web livreur (port alternatif)
                "http://localhost:8084"   // expo web livreur (port nominal)
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
