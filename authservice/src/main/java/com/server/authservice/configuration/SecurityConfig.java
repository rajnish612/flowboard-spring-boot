package com.server.authservice.configuration;


import com.server.authservice.service.Oauth2SuccessHandler;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;


//CUSTOM SECURITY CONFIG TO USED BY SPRING SECURITY
@Slf4j
@EnableWebSecurity
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {
    private final Oauth2SuccessHandler oauth2SuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()).formLogin(formLogin -> formLogin.disable()).authorizeHttpRequests(auth -> auth.requestMatchers("/login/**", "/oauth2/**").permitAll().anyRequest().authenticated()).oauth2Login(oauth -> oauth.failureHandler(((request, response, exception) -> {
                    log.error("Login failed: {}", exception.getMessage());
                    response.sendRedirect("http://localhost:5173/login?error=oauth");
                })).successHandler(oauth2SuccessHandler)) // CUSTOM HANDLER AFTER SUCCESSFUL OAUTH2 AUTHENTICATION
                .oauth2ResourceServer(oauth -> oauth
                        .jwt(jwt -> {
                        }));  // ENABLES JWT BEARER-TOKEN AUTHENTICATION

        ;
        return http.build();
    }


    // CUSTOM JWT DECODER USED BY SPRING SECURITY TO VALIDATE JWTs
    @Bean
    JwtDecoder jwtDecoder(@Value("${jwt.secret}") String secret) {

        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));

        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }
}
