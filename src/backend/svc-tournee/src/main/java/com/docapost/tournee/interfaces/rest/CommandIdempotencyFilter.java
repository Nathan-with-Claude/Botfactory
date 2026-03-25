package com.docapost.tournee.interfaces.rest;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * CommandIdempotencyFilter — Filtre d'idempotence (US-006)
 *
 * Implémente le SC3 de US-006 : le backend rejette silencieusement les commandes
 * dupliquées en se basant sur le header X-Command-Id (UUID v7 côté mobile).
 *
 * Comportement :
 *  - Si le header X-Command-Id est absent → la requête est traitée normalement.
 *  - Si le commandId est connu (déjà traité) → 409 Conflict renvoyé immédiatement.
 *  - Sinon → la requête est traitée et le commandId est enregistré.
 *
 * Implémentation MVP :
 *  - Stockage en mémoire avec ConcurrentHashMap (valide pour un déploiement mono-instance).
 *  - En prod multi-instance, remplacer par Redis (spring-boot-starter-data-redis).
 *  - Rétention de 7 jours (les commandIds plus anciens sont ignorés).
 *
 * Routes concernées (POST uniquement) :
 *  - POST /api/tournees/{tourneeId}/colis/{colisId}/livraison
 *  - POST /api/tournees/{tourneeId}/colis/{colisId}/echec
 *
 * TODO Sprint 4 : migrer vers Redis pour garantir l'idempotence en multi-instance.
 */
@Component
public class CommandIdempotencyFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(CommandIdempotencyFilter.class);
    private static final String HEADER_COMMAND_ID = "X-Command-Id";

    /** Durée de rétention en millisecondes (7 jours) */
    private static final long RETENTION_MS = TimeUnit.DAYS.toMillis(7);

    /** Routes soumises à l'idempotence */
    private static final Set<String> IDEMPOTENT_PATH_SUFFIXES = Set.of(
            "/livraison",
            "/echec"
    );

    /**
     * Cache en mémoire : commandId → timestamp de traitement.
     * ConcurrentHashMap pour la thread-safety.
     * TODO Sprint 4 : remplacer par Redis pour multi-instance.
     */
    private final ConcurrentHashMap<String, Long> processedCommands = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String commandId = request.getHeader(HEADER_COMMAND_ID);

        // Pas de commandId → traitement normal (appelants non-offline)
        if (commandId == null || commandId.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Vérification uniquement pour les méthodes POST
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // Vérification uniquement pour les routes offline (livraison / echec)
        String path = request.getRequestURI();
        boolean isIdempotentRoute = IDEMPOTENT_PATH_SUFFIXES.stream()
                .anyMatch(path::endsWith);

        if (!isIdempotentRoute) {
            filterChain.doFilter(request, response);
            return;
        }

        // Nettoyage des entrées expirées (lazy cleanup)
        evictExpiredEntries();

        // SC3 — Doublon détecté → 409 silencieux
        if (processedCommands.containsKey(commandId)) {
            log.info("[US-006] CommandId dupliqué ignoré : {}", commandId);
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\":\"COMMAND_ALREADY_PROCESSED\",\"commandId\":\"" + commandId + "\"}"
            );
            return;
        }

        // Traitement de la requête
        filterChain.doFilter(request, response);

        // Enregistrement du commandId après traitement réussi (2xx)
        if (response.getStatus() >= 200 && response.getStatus() < 300) {
            processedCommands.put(commandId, System.currentTimeMillis());
            log.debug("[US-006] CommandId enregistré : {}", commandId);
        }
    }

    /** Supprime les entrées expirées du cache en mémoire */
    private void evictExpiredEntries() {
        long cutoff = System.currentTimeMillis() - RETENTION_MS;
        processedCommands.entrySet().removeIf(entry -> entry.getValue() < cutoff);
    }
}
