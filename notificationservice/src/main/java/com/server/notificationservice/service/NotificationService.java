package com.server.notificationservice.service;


import com.server.notificationservice.client.AuthClient;
import com.server.notificationservice.client.TaskClient;
import com.server.notificationservice.client.WorkspaceClient;
import com.server.notificationservice.dto.*;

import com.server.notificationservice.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.server.notificationservice.repository.NotificationRepository;
import com.server.notificationservice.websocket.NotificationPublisher;

import java.util.List;


//Service to manage notification
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final WorkspaceClient workspaceClient;
    private final NotificationPublisher notificationPublisher;
    private final AuthClient authClient;
    private final TaskClient taskClient;

    /// Process a notification event.
    @Transactional
    public void processNotificationEvent(NotificationEvent event) {

        List<Long> recipientIds;

        if (event.isNotifyAllMembers()) {

            // Get all workspace members when everyone should be notified.
            recipientIds = workspaceClient
                    .getWorkspaceMemberIds(event.getWorkspaceId());

        } else {

            // Use the specific recipients for a targeted notification.
            if (event.getRecipientIds() == null ||
                    event.getRecipientIds().isEmpty()) {

                throw new IllegalArgumentException(
                        "recipientIds is required for a targeted notification"
                );
            }

            recipientIds = event.getRecipientIds();
        }

        // Don't notify the user who performed the action.
        recipientIds = recipientIds.stream()
                .filter(id -> !id.equals(event.getActorId()))
                .distinct()
                .toList();

        if (recipientIds.isEmpty()) {
            return;
        }

        /*
         * Fetch related data once.
         *
         * This is important when notifying many workspace members.
         * We don't want to call Auth/Workspace/Task Service for every recipient.
         */
        UserDTO actor = authClient.getUserById(event.getActorId());

        WorkspaceDTO workspace =
                workspaceClient.getWorkspaceById(event.getWorkspaceId());

        BoardDTO board = null;

        if (event.getBoardId() != null) {
            board = workspaceClient
                    .getBoardsByBoardsId(List.of(event.getBoardId()))
                    .stream()
                    .findFirst()
                    .orElse(null);
        }

        CardDTO card = null;

        if (event.getCardId() != null) {
            card = taskClient.getCardById(event.getCardId());
        }

        /*
         * Create one database notification for every recipient.
         */
        List<Notification> notifications = recipientIds.stream()
                .map(recipientId -> Notification.builder()
                        .recipientId(recipientId)
                        .actorId(event.getActorId())
                        .workspaceId(event.getWorkspaceId())
                        .boardId(event.getBoardId())
                        .cardId(event.getCardId())
                        .type(event.getType())
                        .title(event.getTitle())
                        .message(event.getMessage())
                        .read(false)
                        .build())
                .toList();

        // Save all notifications in one database operation.
        List<Notification> savedNotifications =
                notificationRepository.saveAll(notifications);

        /*
         * Send the populated notification to each recipient.
         */
        for (Notification notification : savedNotifications) {

            NotificationDTO dto = toDTO(
                    notification,
                    actor,
                    workspace,
                    board,
                    card
            );

            notificationPublisher.publish(
                    notification.getRecipientId(),
                    dto
            );
        }
    }


    // Get all notifications of the authenticated user.
    public List<NotificationDTO> getNotifications(Long userId) {

        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toPopulatedDTO)
                .toList();
    }


    // Get only unread notifications of the authenticated user.
    public List<NotificationDTO> getUnreadNotifications(Long userId) {

        return notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toPopulatedDTO)
                .toList();
    }


    // Get the unread notification count.
    public long getUnreadCount(Long userId) {

        return notificationRepository
                .countByRecipientIdAndReadFalse(userId);
    }


    // Mark one notification as read.
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {

        int updatedRows =
                notificationRepository.markAsRead(
                        notificationId,
                        userId
                );

        if (updatedRows == 0) {
            throw new IllegalArgumentException(
                    "Notification not found"
            );
        }
    }


    // Mark all unread notifications as read.
    @Transactional
    public void markAllAsRead(Long userId) {

        notificationRepository.markAllAsRead(userId);
    }


    // Build a populated DTO for a newly created notification.
    private NotificationDTO toDTO(
            Notification notification,
            UserDTO actor,
            WorkspaceDTO workspace,
            BoardDTO board,
            CardDTO card
    ) {

        return NotificationDTO.builder()
                .id(notification.getId())

                .recipientId(notification.getRecipientId())

                .actorId(notification.getActorId())
                .actorName(actor != null ? actor.getName() : null)
                .actorAvatar(actor != null ? actor.getAvatar() : null)

                .workspaceId(notification.getWorkspaceId())
                .workspaceName(
                        workspace != null
                                ? workspace.getName()
                                : null
                )

                .boardId(notification.getBoardId())
                .boardName(
                        board != null
                                ? board.getName()
                                : null
                )

                .cardId(notification.getCardId())
                .cardTitle(
                        card != null
                                ? card.getTitle()
                                : null
                )

                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())

                .build();
    }


    // Populate a notification when loading notification history.
    private NotificationDTO toPopulatedDTO(
            Notification notification
    ) {

        UserDTO actor =
                authClient.getUserById(notification.getActorId());

        WorkspaceDTO workspace = null;

        if (notification.getWorkspaceId() != null) {
            workspace = workspaceClient.getWorkspaceById(
                    notification.getWorkspaceId()
            );
        }

        BoardDTO board = null;

        if (notification.getBoardId() != null) {

            board = workspaceClient
                    .getBoardsByBoardsId(
                            List.of(notification.getBoardId())
                    )
                    .stream()
                    .findFirst()
                    .orElse(null);
        }

        CardDTO card = null;

        if (notification.getCardId() != null) {
            card = taskClient.getCardById(
                    notification.getCardId()
            );
        }

        return toDTO(
                notification,
                actor,
                workspace,
                board,
                card
        );
    }
}