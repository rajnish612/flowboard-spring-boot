package com.server.notificationservice.controller;

import com.server.notificationservice.dto.NotificationDTO;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.server.notificationservice.service.NotificationService;

import java.util.List;


@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Get all notifications belonging to the authenticated user.
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = jwt.getClaim("userId");

        return ResponseEntity.ok(
                notificationService.getNotifications(userId)
        );
    }

    // Get only unread notifications belonging to the authenticated user.
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = jwt.getClaim("userId");

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(userId)
        );
    }

    // Get the number of unread notifications.
    @GetMapping("/count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = jwt.getClaim("userId");

        return ResponseEntity.ok(
                notificationService.getUnreadCount(userId)
        );
    }

    // Mark a single notification as read.
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = jwt.getClaim("userId");

        notificationService.markAsRead(notificationId, userId);

        return ResponseEntity.noContent().build();
    }

    // Mark all notifications belonging to the authenticated user as read.
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = jwt.getClaim("userId");

        notificationService.markAllAsRead(userId);

        return ResponseEntity.noContent().build();
    }
}