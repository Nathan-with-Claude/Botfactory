package com.docapost.supervision.interfaces.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * InternalSecretFilter — Protection de l'endpoint interne inter-services (US-058).
 *
 * Vérifie la présence et la validité du header X-Internal-Secret sur les requêtes
 * adressées à /api/supervision/internal/**.
 *
 * En dev (secret = "dev-secret-ignored") : toutes les requêtes sont acceptées,
 * car le MockJwtAuthFilter est déjà actif et le profil dev est sans authentification stricte.
 *
 * En prod : le header X-Internal-Secret doit correspondre à la valeur configurée
 * via la variable d'environnement INTERNAL_SECRET.
 *
 * Ce filtre est enregistré dans SecurityConfig et appliqué avant UsernamePasswordAuthenticationFilter.
 */
public class InternalSecretFilter extends OncePerRequestFilter {

    static final String DEV_SECRET = "dev-secret-ignored";
    static final String INTERNAL_PATH_PREFIX = "/api/supervision/internal/";
    static final String SECRET_HEADER = "X-Internal-Secret";

    private final String expectedSecret;

    public InternalSecretFilter(String expectedSecret) {
        this.expectedSecret = expectedSecret;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith(INTERNAL_PATH_PREFIX)) {
            // En mode dev ou si le secret n'est pas configuré (vide), on bypasse le contrôle
            if (DEV_SECRET.equals(expectedSecret) || expectedSecret == null || expectedSecret.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }

            // En prod : vérifier le header X-Internal-Secret
            String providedSecret = request.getHeader(SECRET_HEADER);
            if (providedSecret == null || !expectedSecret.equals(providedSecret)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Accès refusé — secret interne invalide\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
