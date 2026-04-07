package com.docapost.supervision.infrastructure.dev;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration Spring pour le profil dev — fournit le RestTemplate
 * utilisé par DevEventBridge.
 *
 * Séparé de la config principale pour ne pas polluer le contexte prod.
 *
 * Source : US-033
 */
@Configuration
@Profile({"dev", "recette"})
public class DevRestConfig {

    @Bean
    public RestTemplate devRestTemplate() {
        return new RestTemplate();
    }
}
