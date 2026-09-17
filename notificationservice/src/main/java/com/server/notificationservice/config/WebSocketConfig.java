package com.server.notificationservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Value("${app.websocket.allowed-origins}")
    private String[] allowedOrigins;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    // Configure the message broker used to deliver notifications.
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // Broker destinations used to deliver messages to clients.
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix for messages sent from the client to the server.
        registry.setApplicationDestinationPrefixes("/app");

        // Prefix used for user-specific destinations.
        registry.setUserDestinationPrefix("/user");
    }

    // Endpoint that the frontend uses to establish the WebSocket connection.
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/ws")
                .addInterceptors(jwtHandshakeInterceptor)
                .setHandshakeHandler(new UserHandshakeHandler())
                .setAllowedOrigins(allowedOrigins);
    }
}