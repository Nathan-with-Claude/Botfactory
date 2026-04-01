package com.docapost.tournee.infrastructure.supervision;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration — SupervisionConfig (US-032)
 *
 * Declare le bean RestTemplate utilise par SupervisionNotifier
 * pour les appels HTTP vers svc-supervision.
 */
@Configuration
public class SupervisionConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
