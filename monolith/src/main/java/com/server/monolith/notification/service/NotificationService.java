package com.server.monolith.notification.service;


import com.server.monolith.auth.dto.UserDTO;
import com.server.monolith.auth.service.UserService;
import com.server.monolith.notification.dto.*;
import com.server.monolith.notification.entity.Notification;
import com.server.monolith.notification.repository.NotificationRepository;
import com.server.monolith.notification.websocket.NotificationPublisher;
import com.server.monolith.workspace.dto.BoardDTO;
import com.server.monolith.workspace.dto.WorkspaceDTO;
import com.server.monolith.workspace.service.BoardService;
import com.server.monolith.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;


//Service to manage notification
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final WorkspaceService workspaceService;
    private final BoardService boardService;
    private final NotificationPublisher notificationPublisher;
    private final UserService userService;

    /// Process a notification event.
    @Transactional
    public void processNotificationEvent(NotificationEvent event) {

        List<Long> recipientIds;

        if (event.getRecipientIds() == null || event.getRecipientIds().isEmpty()) {
            throw new IllegalArgumentException(
                    "recipientIds is required for a Kafka notification event"
            );
        }

        recipientIds = event.getRecipientIds();

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
        UserDTO actor = UserDTO.builder()
                .id(event.getActorId())
                .name(event.getActorName())
                .avatar(event.getActorAvatar())
                .build();

        WorkspaceDTO workspace = WorkspaceDTO.builder()
                .id(event.getWorkspaceId())
                .name(event.getWorkspaceName())
                .build();

        BoardDTO board = event.getBoardId() == null ? null : BoardDTO.builder()
                .id(event.getBoardId())
                .name(event.getBoardName())
                .build();


        /*
         * Create one database notification for every recipient.
         */
        List<Notification> notifications = recipientIds.stream()
                .map(recipientId -> Notification.builder()
                        .recipientId(recipientId)
                        .actorId(event.getActorId())
                        .workspaceId(event.getWorkspaceId())
                        .boardId(event.getBoardId())
                        .type(event.getType())
                        .title(event.getTitle())
                        .message(event.getMessage())
                        .read(false)
                        .build())
                .toList();

        // Save all notifications in one database operation.
        List<Notification> savedNotifications =
                notificationRepository.saveAll(notifications);
//        Send the populated notification to each recipient.
        for (Notification notification : savedNotifications) {

            NotificationDTO dto = toDTO(
                    notification,
                    actor,
                    workspace,
                    board
            );

            notificationPublisher.publish(
                    notification.getRecipientId(),
                    dto
            );
        }
    }


    // Get all notifications of the authenticated user.
    public List<NotificationDTO> getNotifications(Long userId) {

        //Get notifications
        List<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId);
        if (notifications.isEmpty()) {
            return List.of();
        }

        // 2. Extract IDs, ignoring nulls and duplicates
        List<Long> workspaceIds = notifications.stream().map(Notification::getWorkspaceId).filter(Objects::nonNull)
                .distinct().toList();
        List<Long> actorIds = notifications.stream().map(Notification::getActorId).filter(Objects::nonNull)
                .distinct().toList();
        List<Long> boardIds = notifications.stream().map(Notification::getBoardId).filter(Objects::nonNull)
                .distinct().toList();


        // 3. Fetch related data
        List<WorkspaceDTO> workspaces = workspaceIds.isEmpty()
                ? List.of()
                : workspaceService.getWorkspacesByWorkspaceId(workspaceIds);

        List<UserDTO> actors = actorIds.isEmpty()
                ? List.of()
                : userService.getUsersByIds(actorIds);

        List<BoardDTO> boards = boardIds.isEmpty()
                ? List.of()
                : boardService.getBoardsByIds(boardIds);


        // 4. Convert lists into maps for fast lookup by ID
        Map<Long, WorkspaceDTO> workspaceMap = workspaces.stream()
                .collect(Collectors.toMap(
                        WorkspaceDTO::getId,
                        Function.identity()
                ));

        Map<Long, UserDTO> actorMap = actors.stream()
                .collect(Collectors.toMap(
                        UserDTO::getId,
                        Function.identity()
                ));

        Map<Long, BoardDTO> boardMap = boards.stream()
                .collect(Collectors.toMap(
                        BoardDTO::getId,
                        Function.identity()
                ));


        // 5. Build NotificationDTOs
        return notifications.stream()
                .filter(notification ->
                        notification.getWorkspaceId() != null
                                && notification.getBoardId() != null
                                && workspaceMap.containsKey(notification.getWorkspaceId())
                                && boardMap.containsKey(notification.getBoardId())
                )
                .map(notification -> {

                    WorkspaceDTO workspace =
                            workspaceMap.get(notification.getWorkspaceId());

                    UserDTO actor =
                            actorMap.get(notification.getActorId());

                    BoardDTO board =
                            boardMap.get(notification.getBoardId());


                    return toDTO(
                            notification,
                            actor,
                            workspace,
                            board
                    );
                })
                .toList();
    }


    // Get only unread notifications of the authenticated user.
    public List<NotificationDTO> getUnreadNotifications(Long userId) {

        return List.of();
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
            BoardDTO board
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


                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())

                .build();
    }


}