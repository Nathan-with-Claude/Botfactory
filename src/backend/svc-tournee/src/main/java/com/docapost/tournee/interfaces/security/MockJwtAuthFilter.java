package com.docapost.tournee.interfaces.security;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * MockJwtAuthFilter — Filtre d'authentification factice, actif UNIQUEMENT en profil "dev".
 *
 * Lit le header Authorization: Bearer <token>, extrait le payload (partie centrale
 * du fake JWT base64), parse le JSON et lit le champ "sub" pour identifier le livreur.
 * Si le header est absent ou si le parsing echoue, fallback sur "livreur-001".
 *
 * Compatible avec les fake JWT produits par devAuthOptions.ts (US-047) :
 *   header.payload.signature  où payload = base64({"sub":"livreur-XXX","roles":[...]})
 *
 * TEMPORAIRE — Ce filtre sera remplace par le filtre JWT Keycloak reel
 * lors de l'implementation de US-019 (Authentification SSO mobile).
 * A ce moment, supprimer ce composant et configurer Spring Security pour
 * valider les tokens OAuth2/OIDC du SSO corporate.
 *
 * TODO : supprimer quand US-019 est implemente.
 */
@Component
@Profile({"dev", "recette"})
public class MockJwtAuthFilter extends OncePerRequestFilter {

    private static final String FALLBACK_LIVREUR_ID = "livreur-001";
    private static final String MOCK_ROLE = "ROLE_LIVREUR";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Injecte l'identite mock si pas encore authentifie
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String livreurId = extractLivreurId(request);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            livreurId,
                            null,
                            List.of(new SimpleGrantedAuthority(MOCK_ROLE))
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrait le livreurId depuis le header Authorization: Bearer <fakeJwt>.
     * Le fake JWT produit par devAuthOptions.ts a la forme : header.payload.signature
     * où payload est du JSON base64-encodé contenant {"sub": "livreur-XXX", ...}.
     *
     * @return livreurId extrait, ou "livreur-001" en cas d'absence ou d'erreur.
     */
    String extractLivreurId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                String token = header.substring(7);
                String[] parts = token.split("\\.");
                if (parts.length == 3) {
                    // Ajouter le padding base64 si nécessaire
                    String base64Payload = parts[1];
                    int pad = base64Payload.length() % 4;
                    if (pad == 2) base64Payload += "==";
                    else if (pad == 3) base64Payload += "=";

                    byte[] decoded = Base64.getDecoder().decode(base64Payload);
                    String json = new String(decoded);

                    @SuppressWarnings("unchecked")
                    Map<String, Object> payload = objectMapper.readValue(json, Map.class);
                    Object sub = payload.get("sub");
                    if (sub instanceof String subStr && !subStr.isBlank()) {
                        return subStr;
                    }
                }
            } catch (Exception ignored) {
                // Fallback sur livreur-001
            }
        }
        return FALLBACK_LIVREUR_ID;
    }
}
