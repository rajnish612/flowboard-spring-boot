package com.server.notificationservice.dto;


import com.server.notificationservice.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;


//DTO object for notifications
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    // Unique notification ID.
    private Long id;

    // User who receives the notification.
    private Long recipientId;

    // User who performed the action.
    private Long actorId;

    // Populated from Auth Service for the client.
    private String actorName;

    // Populated from Auth Service for the client.
    private String actorAvatar;

    // Related workspace.
    private Long workspaceId;

    // Populated from Workspace Service for the client.
    private String workspaceName;

    // Related board.
    private Long boardId;

    // Populated from Workspace Service for the client.
    private String boardName;



    // Type of notification.
    private NotificationType type;

    // Notification heading.
    private String title;

    // Notification message.
    private String message;

    // Whether the recipient has read the notification.
    private boolean read;

    // Time when the notification was created.
    private LocalDateTime createdAt;
}

