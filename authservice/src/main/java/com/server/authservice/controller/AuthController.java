package com.server.authservice.controller;

import com.server.authservice.model.User;
import com.server.authservice.dto.ProfileDTO;
import com.server.authservice.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/")
public class AuthController {

    private final UserRepo userRepo;


    //Endpoint to fetch user profile from the db using user's id
    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getProfile(@AuthenticationPrincipal Jwt authentication) {

        String email = authentication.getSubject();
        Long userId = authentication.getClaim("userId");

        log.info("Authenticated user with email: {}", email);
        assert userId != null;
        User user = userRepo.findById(userId).orElseThrow(() -> new UsernameNotFoundException("Email not found "));
        ProfileDTO profile = ProfileDTO.builder().name(user.getName()).email(user.getEmail()).avatar(user.getAvatar()).id(user.getId()).build();
        log.info("Retrieved profile for user with email: {}", email);
        return ResponseEntity.ok(profile);
    }
}
