package com.server.notificationservice.service;

import com.server.notificationservice.client.AuthClient;
import com.server.notificationservice.client.TaskClient;
import com.server.notificationservice.client.WorkspaceClient;
import com.server.notificationservice.dto.*;

import com.server.notificationservice.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.server.notificationservice.repository.NotificationRepository;
import com.server.notificationservice.websocket.NotificationPublisher;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

//Service to manage notification
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
        private final NotificationRepository notificationRepository;
        private final WorkspaceClient workspaceClient;
        private final NotificationPublisher notificationPublisher;
        private final AuthClient authClient;

        /// Process a notification event.
        @Transactional
        public void processNotificationEvent(NotificationEvent event) {
                log.info("Processing notification event: type={}, actorId={}, workspaceId={}",
                                event.getType(),
                                event.getActorId(),
                                event.getWorkspaceId());

                List<Long> recipientIds;

                if (event.getRecipientIds() == null || event.getRecipientIds().isEmpty()) {
                        throw new IllegalArgumentException(
                                        "recipientIds is required for a Kafka notification event");
                }

                recipientIds = event.getRecipientIds();

                // Don't notify the user who performed the action.
                recipientIds = recipientIds.stream()
                                .filter(id -> !id.equals(event.getActorId()))
                                .distinct()
                                .toList();

                if (recipientIds.isEmpty()) {
                        log.debug("No recipients after filtering actorId={}", event.getActorId());

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

                BoardDTO board = event.getBoardId() == null ? null
                                : BoardDTO.builder()
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
                List<Notification> savedNotifications = notificationRepository.saveAll(notifications);
                // Send the populated notification to each recipient.
                for (Notification notification : savedNotifications) {

                        NotificationDTO dto = toDTO(
                                        notification,
                                        actor,
                                        workspace,
                                        board);

                        notificationPublisher.publish(
                                        notification.getRecipientId(),
                                        dto);
                }
                log.info("Notification event processed successfully: type={}, notificationsCreated={}",
                                event.getType(),
                                savedNotifications.size());
        }

        // Get all notifications of the authenticated user.
        public Page<NotificationDTO> getNotifications(Long userId, Pageable pageable) {
                log.info("Fetching notifications for user with id: {}", userId);
                // Get notifications
                Page<Notification> notificationPage = notificationRepository
                                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable);
                List<Notification> notifications = notificationPage.getContent();
                if (notifications.isEmpty()) {
                        log.debug("No notifications found for user with id: {}", userId);
                            return new PageImpl<>(List.of(), pageable, notificationPage.getTotalElements());
                }

                // 2. Extract IDs, ignoring nulls and duplicates
                List<Long> workspaceIds = notifications.stream().map(Notification::getWorkspaceId)
                                .filter(Objects::nonNull)
                                .distinct().toList();
                List<Long> actorIds = notifications.stream().map(Notification::getActorId).filter(Objects::nonNull)
                                .distinct().toList();
                List<Long> boardIds = notifications.stream().map(Notification::getBoardId).filter(Objects::nonNull)
                                .distinct().toList();

                // 3. Fetch related data
                List<WorkspaceDTO> workspaces = workspaceIds.isEmpty()
                                ? List.of()
                                : workspaceClient.getWorkspacesByWorkspaceId(workspaceIds);

                List<UserDTO> actors = actorIds.isEmpty()
                                ? List.of()
                                : authClient.getUsersByUserId(actorIds);

                List<BoardDTO> boards = boardIds.isEmpty()
                                ? List.of()
                                : workspaceClient.getBoardsByBoardsId(boardIds);

                // 4. Convert lists into maps for fast lookup by ID
                Map<Long, WorkspaceDTO> workspaceMap = workspaces.stream()
                                .collect(Collectors.toMap(
                                                WorkspaceDTO::getId,
                                                Function.identity()));

                Map<Long, UserDTO> actorMap = actors.stream()
                                .collect(Collectors.toMap(
                                                UserDTO::getId,
                                                Function.identity()));

                Map<Long, BoardDTO> boardMap = boards.stream()
                                .collect(Collectors.toMap(
                                                BoardDTO::getId,
                                                Function.identity()));

                // 5. Build NotificationDTOs
                log.info("Fetched notifications {} for user with id: {}", notifications.size(), userId);
                List<NotificationDTO> result = notifications.stream()
                                .filter(notification -> notification.getWorkspaceId() != null
                                                && notification.getBoardId() != null
                                                && workspaceMap.containsKey(notification.getWorkspaceId())
                                                && boardMap.containsKey(notification.getBoardId()))
                                .map(notification -> toDTO(notification, actorMap.get(notification.getActorId()),
                                                workspaceMap.get(notification.getWorkspaceId()),
                                                boardMap.get(notification.getBoardId())))
                                .toList();
                return new PageImpl<>(result, pageable, notificationPage.getTotalElements());
        }

        // Get only unread notifications of the authenticated user.
        public List<NotificationDTO> getUnreadNotifications(Long userId) {
                log.info("Fetching unread notifications count for user with id: {}", userId);
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
                log.info("Marking notifications as read for user with id: {}", userId);

                int updatedRows = notificationRepository.markAsRead(
                                notificationId,
                                userId);

                if (updatedRows == 0) {
                        log.info("Notifications not found for userwith id: {}", userId);

                        throw new IllegalArgumentException(
                                        "Notification not found");
                }
        }

        // Mark all unread notifications as read.
        @Transactional
        public void markAllAsRead(Long userId) {
                log.info("Marking all notifications as read for user with id: {}", userId);

                notificationRepository.markAllAsRead(userId);
        }

        // Build a populated DTO for a newly created notification.
        private NotificationDTO toDTO(
                        Notification notification,
                        UserDTO actor,
                        WorkspaceDTO workspace,
                        BoardDTO board) {

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
                                                                : null)

                                .boardId(notification.getBoardId())
                                .boardName(
                                                board != null
                                                                ? board.getName()
                                                                : null)

                                .type(notification.getType())
                                .title(notification.getTitle())
                                .message(notification.getMessage())
                                .read(notification.isRead())
                                .createdAt(notification.getCreatedAt())

                                .build();
        }

}