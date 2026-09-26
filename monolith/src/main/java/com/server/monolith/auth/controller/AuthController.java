package com.server.monolith.auth.controller;

import com.server.monolith.auth.dto.UserDTO;
import com.server.monolith.auth.model.User;
import com.server.monolith.auth.repository.UserRepo;
import com.server.monolith.auth.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepo userRepo;
    private final UserService userService;
    @Value("${app.cookie.secure}")
    private boolean cookieSecure;
    @Value("${app.cookie.same-site}")
    private String cookieSameSite;

    // Endpoint to fetch user profile from the db using user's id
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@AuthenticationPrincipal Jwt authentication) {

        String email = authentication.getSubject();
        Long userId = authentication.getClaim("userId");

        log.info("Authenticated user with email: {}", email);
        assert userId != null;
        User user = userRepo.findById(userId).orElseThrow(() -> new UsernameNotFoundException("Email not found "));
        UserDTO profile = UserDTO.builder().name(user.getName()).email(user.getEmail()).avatar(user.getAvatar())
                .id(user.getId()).build();
        log.info("Retrieved profile for user with email: {}", email);
        return ResponseEntity.ok(profile);
    }

    // Endpoint to get single profile using user Id
    @GetMapping("/profile/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // Endpoint to get multiple users through userIds
    @PostMapping("/users")
    public ResponseEntity<List<UserDTO>> getUsers(@Valid @RequestBody List<Long> userIds) {

        return ResponseEntity.ok(
                userService.getUsersByIds(userIds));
    }

    // Endpoint to get user through email
    @GetMapping("/user/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable("email") String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    // Endpoint to search users by email
    @GetMapping("/user/search/{email}")
    public ResponseEntity<List<UserDTO>> searchUsersByEmail(@PathVariable("email") String email,
            @AuthenticationPrincipal Jwt jwt) {
        String userEmail = jwt.getSubject();
        return ResponseEntity.ok(userService.searchUsersByEmail(email, userEmail));
    }

    // Endpoint to logout user
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie.from("AUTH_TOKEN", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite)
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok("Logged out successfully");
    }
}
