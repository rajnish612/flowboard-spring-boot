package com.server.authservice.controller;

import com.server.authservice.model.User;
import com.server.authservice.dto.ProfileDTO;
import com.server.authservice.repository.UserRepo;
import com.server.authservice.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/")
public class AuthController {

    private final UserRepo userRepo;
    private final UserService userService;

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

    //Endpoint to get single profile using user Id
    @GetMapping("/profile/{id}")
    public ResponseEntity<ProfileDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    //Endpoint to get multiple users through userIds
    @PostMapping("/users")
    public ResponseEntity<List<ProfileDTO>> getUsers(@RequestBody List<Long> userIds) {

        return ResponseEntity.ok(
                userService.getUsersByIds(userIds)
        );
    }

    //Endpoint to get  user through email
    @GetMapping("/user/{email}")
    public ResponseEntity<ProfileDTO> getUserByEmail(@PathVariable("email") String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    //Endpoint to search  users by email
    @GetMapping("/user/search/{email}")
    public ResponseEntity<List<ProfileDTO>> searchUsersByEmail(@PathVariable("email") String email, @AuthenticationPrincipal Jwt jwt) {
        String userEmail = jwt.getSubject();
        return ResponseEntity.ok(userService.searchUsersByEmail(email, userEmail));
    }


    //Endpoint to logout user
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            HttpServletResponse response) {

        Cookie cookie = new Cookie("AUTH_TOKEN", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // false locally if you're using plain HTTP
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        return ResponseEntity.ok("Logged out successfully");
    }
}
