package com.server.authservice.service;

import com.server.authservice.model.User;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.REMOVED.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

//CUSTOM OAUTH2 SUCCESS EXECUTED AFTER SUCCESSFULL OAUTH AUTHENTICATION
@Component
@RequiredArgsConstructor
public class Oauth2SuccessHandler implements AuthenticationSuccessHandler {
    private final AuthService authService;
    private final JwtService jwtService;

    //   METHOD TO GENERATE JWT AND REDIRECT AFTER SUCCESSFULL OAUTH AUTHENTICATION
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        String email = oidcUser.getEmail();
        if (email == null) {
            throw new IllegalStateException("Email not provided by Google");
        }
        String name = oidcUser.getFullName();
        String avatar = oidcUser.getPicture();
        User REMOVED = User.builder()
                .name(name)
                .email(email)
                .avatar(avatar)
                .build();
        User oauthUser = authService.retrieveUserThroughEmail(REMOVED);
        String token = jwtService.generateToken(oauthUser.getEmail());
        response.sendRedirect(
                "http://localhost:5173/oauth-success?token=" + token
        );
    }
}
