package com.docapost.supervision.interfaces.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires TDD — InternalSecretFilter (US-058)
 *
 * Vérifie la protection de l'endpoint interne /api/supervision/internal/** :
 * - SC1 : Requête hors endpoint interne → toujours acceptée (filtre transparent)
 * - SC2 : Secret DEV ("dev-secret-ignored") → bypass systématique
 * - SC3 : Secret vide (non configuré) → bypass (profil sans INTERNAL_SECRET)
 * - SC4 : Prod + header correct → acceptée
 * - SC5 : Prod + header absent → 403
 * - SC6 : Prod + header incorrect → 403
 * - SC7 : Prod + endpoint non interne → acceptée sans contrôle
 */
class InternalSecretFilterTest {

    // ─── SC1 : Hors endpoint interne ────────────────────────────────────────

    @Test
    @DisplayName("SC1 - Requête sur /api/supervision/tableau-de-bord : pas de contrôle du secret")
    void requete_hors_endpoint_interne_passe_toujours() throws Exception {
        InternalSecretFilter filter = new InternalSecretFilter("mon-super-secret-prod");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/supervision/tableau-de-bord");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
        assertThat(chain.getRequest()).isNotNull(); // filter chain appelée
    }

    // ─── SC2 : Secret DEV → bypass ──────────────────────────────────────────

    @Test
    @DisplayName("SC2 - Secret DEV ('dev-secret-ignored') : accès endpoint interne toujours accordé")
    void secret_dev_bypass_endpoint_interne() throws Exception {
        InternalSecretFilter filter = new InternalSecretFilter(InternalSecretFilter.DEV_SECRET);
        MockHttpServletRequest request = new MockHttpServletRequest("POST",
                "/api/supervision/internal/vue-tournee/events");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
        assertThat(chain.getRequest()).isNotNull(); // filter chain appelée (pas de 403)
    }

    // ─── SC3 : Secret vide → bypass ─────────────────────────────────────────

    @Test
    @DisplayName("SC3 - Secret vide : endpoint interne accessible (INTERNAL_SECRET non configuré)")
    void secret_vide_bypass_endpoint_interne() throws Exception {
        InternalSecretFilter filter = new InternalSecretFilter("");
        MockHttpServletRequest request = new MockHttpServletRequest("POST",
                "/api/supervision/internal/vue-tournee/events");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
        assertThat(chain.getRequest()).isNotNull();
    }

    // ─── SC4 : Prod + header correct → acceptée ─────────────────────────────

    @Test
    @DisplayName("SC4 - Prod : header X-Internal-Secret correct → 200")
    void prod_header_correct_accepte() throws Exception {
        InternalSecretFilter filter = new InternalSecretFilter("prod-secret-xyz");
        MockHttpServletRequest request = new MockHttpServletRequest("POST",
                "/api/supervision/internal/vue-tournee/events");
        request.addHeader(InternalSecretFilter.SECRET_HEADER, "prod-secret-xyz");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
        assertThat(chain.getRequest()).isNotNull();
    }

    // ─── SC5 : Prod + header absent → 403 ───────────────────────────────────

    @Test
    @DisplayName("SC5 - Prod : header X-Internal-Secret absent → 403")
    void prod_header_absent_403() throws Exception {
        InternalSecretFilter filter = new InternalSecretFilter("prod-secret-xyz");
        MockHttpServletRequest request = new MockHttpServletRequest("POST",
                "/api/supervision/internal/vue-tournee/events");
        // Pas d'ajout du header
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_FORBIDDEN);
        verify(chain, never()).doFilter(any(), any());
    }

    // ─── SC6 : Prod + header incorrect → 403 ────────────────────────────────

    @Test
    @DisplayName("SC6 - Prod : header X-Internal-Secret incorrect → 403")
    void prod_header_incorrect_403() throws Exception {
        InternalSecretFilter filter = new InternalSecretFilter("prod-secret-xyz");
        MockHttpServletRequest request = new MockHttpServletRequest("POST",
                "/api/supervision/internal/vue-tournee/events");
        request.addHeader(InternalSecretFilter.SECRET_HEADER, "mauvais-secret");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_FORBIDDEN);
        verify(chain, never()).doFilter(any(), any());
    }

    // ─── SC7 : Corps JSON de l'erreur 403 ────────────────────────────────────

    @Test
    @DisplayName("SC7 - Prod + header absent : corps de réponse JSON renvoyé")
    void prod_header_absent_corps_json() throws Exception {
        InternalSecretFilter filter = new InternalSecretFilter("prod-secret-xyz");
        MockHttpServletRequest request = new MockHttpServletRequest("POST",
                "/api/supervision/internal/vue-tournee/events");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getContentType()).contains("application/json");
        assertThat(response.getContentAsString()).contains("error");
    }
}
