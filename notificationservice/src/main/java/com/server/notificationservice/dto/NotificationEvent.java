package com.server.notificationservice.dto;

import com.server.notificationservice.entity.NotificationType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent {

    // User who performed the action.
    private Long actorId;

    // Workspace where the action occurred.
    private Long workspaceId;

    // Board related to the action.
    private Long boardId;

    // Card related to the action, if any.
    private Long cardId;

    // Type of notification.
    private NotificationType type;

    // Notification heading.
    private String title;

    // Notification message.
    private String message;

    // Specific users who should receive the notification.
    // Used when notifyAllMembers is false.
    private List<Long> recipientIds;

    // If true, all members of the workspace should receive the notification.
    private boolean notifyAllMembers;

}
