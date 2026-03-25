package com.docapost.oms.interfaces.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuration Spring Security pour svc-oms (BC-05).
 *
 * CSRF toujours désactivé (API REST stateless).
 * Profil dev : MockJwtAuthFilter injecté via @Autowired(required=false).
 * Profil prod : OAuth2 JWT (Keycloak) — Sprint 3 (US-019/020).
 */
@Configuration
public class SecurityConfig {

    private final MockJwtAuthFilter mockJwtAuthFilter;

    public SecurityConfig(
            @Autowired(required = false) MockJwtAuthFilter mockJwtAuthFilter
    ) {
        this.mockJwtAuthFilter = mockJwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**", "/h2-console/**").permitAll()
                        .anyRequest().authenticated()
                )
                .headers(h -> h.frameOptions(f -> f.sameOrigin()));

        if (mockJwtAuthFilter != null) {
            http.addFilterBefore(mockJwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }
}
