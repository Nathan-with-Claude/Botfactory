package com.docapost.oms.interfaces.security;

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
 * Filtre de sécurité mock (profil dev uniquement).
 *
 * Injecte automatiquement ROLE_SUPERVISEUR et ROLE_SYSTEME pour permettre
 * les tests sans provisionnement Keycloak.
 */
@Component
@Profile("dev")
public class MockJwtAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        var auth = new UsernamePasswordAuthenticationToken(
                "mock-systeme",
                null,
                List.of(
                        new SimpleGrantedAuthority("ROLE_SUPERVISEUR"),
                        new SimpleGrantedAuthority("ROLE_SYSTEME")
                )
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        filterChain.doFilter(request, response);
    }
}
