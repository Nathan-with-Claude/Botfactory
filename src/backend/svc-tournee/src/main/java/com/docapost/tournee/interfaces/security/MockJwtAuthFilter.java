package com.docapost.tournee.interfaces.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * MockJwtAuthFilter — Filtre d'authentification factice, actif UNIQUEMENT en profil "dev".
 *
 * Injecte automatiquement une Authentication avec :
 *   - userId  = "livreur-001"
 *   - role    = ROLE_LIVREUR
 *
 * TEMPORAIRE — Ce filtre sera remplace par le filtre JWT Keycloak reel
 * lors de l'implementation de US-019 (Authentification SSO mobile).
 * A ce moment, supprimer ce composant et configurer Spring Security pour
 * valider les tokens OAuth2/OIDC du SSO corporate.
 *
 * TODO : supprimer quand US-019 est implemente.
 */
@Component
@Profile("dev")
public class MockJwtAuthFilter extends OncePerRequestFilter {

    private static final String MOCK_LIVREUR_ID = "livreur-001";
    private static final String MOCK_ROLE = "ROLE_LIVREUR";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Injecte l'identite mock si pas encore authentifie
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            MOCK_LIVREUR_ID,
                            null,
                            List.of(new SimpleGrantedAuthority(MOCK_ROLE))
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
