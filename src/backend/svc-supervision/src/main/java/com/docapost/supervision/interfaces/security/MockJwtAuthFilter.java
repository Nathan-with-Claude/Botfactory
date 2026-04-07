package com.docapost.supervision.interfaces.security;

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
 * MockJwtAuthFilter — Filtre d'authentification factice pour svc-supervision.
 * Actif UNIQUEMENT en profil "dev".
 *
 * Injecte automatiquement une Authentication avec :
 *   - userId  = "superviseur-001"
 *   - role    = ROLE_SUPERVISEUR
 *
 * TEMPORAIRE — Remplacé par le filtre JWT Keycloak lors de US-020.
 */
@Component
@Profile({"dev", "recette"})
public class MockJwtAuthFilter extends OncePerRequestFilter {

    private static final String MOCK_SUPERVISEUR_ID = "superviseur-001";
    private static final String MOCK_ROLE = "ROLE_SUPERVISEUR";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            MOCK_SUPERVISEUR_ID,
                            null,
                            List.of(new SimpleGrantedAuthority(MOCK_ROLE))
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
