package com.server.authservice.controller;

import com.server.authservice.model.User;
import com.server.authservice.dto.ProfileDTO;
import com.server.authservice.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.REMOVEDdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepo REMOVEDRepo;


    //Api to fetch REMOVED profile from the db using REMOVED's email
    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getProfile(@AuthenticationPrincipal Jwt authentication) {
        String email = authentication.getSubject();
        log.info("Authenticated REMOVED with email: {}", email);
        User REMOVED = REMOVEDRepo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Email not found "));
        ProfileDTO profile = ProfileDTO.builder().name(REMOVED.getName()).email(REMOVED.getEmail()).avatar(REMOVED.getAvatar()).build();
        log.info("Retrieved profile for REMOVED with email: {}", email);
        return ResponseEntity.ok(profile);
    }
}
