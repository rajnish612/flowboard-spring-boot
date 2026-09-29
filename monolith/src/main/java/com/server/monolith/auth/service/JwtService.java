package com.server.monolith.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

// Service responsible for generating application JWTs
@Slf4j
@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    // Inject the Base64-encoded JWT secret and token expiration time
    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ) {
        this.secretKey = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(secret)
        );
        this.expiration = expiration;
    }

    // Generate a signed JWT containing the REMOVED's email as the subject
    public String generateToken(Long userId, String email) {
        log.info("Generate JWT Token for user with id: {} and email: {}", userId, email);
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }


}
