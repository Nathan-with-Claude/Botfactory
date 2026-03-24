package com.docapost.tournee.interfaces.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration Spring Security pour svc-tournee.
 *
 * En profil "dev" : MockJwtAuthFilter est injecte via Spring et injecte
 * automatiquement une identite fictive.
 *
 * En profil "prod" : ce filtre est inactif (@Profile("dev")).
 * La configuration JWT Keycloak sera ajoutee dans US-019.
 *
 * TODO : remplacer par la configuration OAuth2 Resource Server lors de US-019.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final MockJwtAuthFilter mockJwtAuthFilter;

    /**
     * Injection optionnelle : en prod, MockJwtAuthFilter n'existe pas (@Profile("dev")).
     * Spring injectera null. Le filtre n'est pas ajoute a la chaine dans ce cas.
     */
    public SecurityConfig(
            @org.springframework.beans.factory.annotation.Autowired(required = false)
            MockJwtAuthFilter mockJwtAuthFilter
    ) {
        this.mockJwtAuthFilter = mockJwtAuthFilter;
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
                        .anyRequest().authenticated()
                );

        // Ajoute le MockJwtAuthFilter uniquement si present (profil dev)
        if (mockJwtAuthFilter != null) {
            http.addFilterBefore(mockJwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        }

        // Autorise les frames H2 console en dev
        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:8082"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
