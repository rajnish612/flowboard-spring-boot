package com.server.monolith.notification.dto;

import com.server.monolith.notification.entity.NotificationType;
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
    private String actorName;
    private String actorAvatar;

    // Workspace where the action occurred.
    private Long workspaceId;
    private String workspaceName;

    // Board related to the action.
    private Long boardId;
    private String boardName;


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

}
