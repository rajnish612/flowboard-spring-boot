package com.server.monolith.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class UserHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(
            ServerHttpRequest request,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) {

        // Get the user ID stored by JwtHandshakeInterceptor.
        Long userId = (Long) attributes.get("userId");

        if (userId == null) {
            return null;
        }

        // Use the user ID as the Principal name.
        return () -> userId.toString();
    }
}
