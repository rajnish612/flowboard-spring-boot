package com.server.taskservice.service;

import com.server.taskservice.client.AuthClient;
import com.server.taskservice.client.WorkspaceClient;
import com.server.taskservice.dto.BoardDTO;
import com.server.taskservice.dto.BoardListDTO;
import com.server.taskservice.dto.NotificationEvent;
import com.server.taskservice.dto.UserDTO;
import com.server.taskservice.dto.WorkspaceDTO;
import com.server.taskservice.kafka.NotificationEventPublisher;
import com.server.taskservice.model.ActivityType;
import com.server.taskservice.model.BoardList;
import com.server.taskservice.repository.BoardListRepo;
import com.server.taskservice.repository.CardRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.server.taskservice.model.NotificationType;

import java.util.List;

// Service for managing Trello-style lists within a board
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardListService {

    private final BoardListRepo boardListRepo;
    private final CardRepo cardRepo;
    private final ActivityService activityService;
    private final AuthClient authClient;
    private final WorkspaceClient workspaceClient;
    private final NotificationEventPublisher notificationEventPublisher;

    // Fetch all lists for a board, already ordered by position
    public List<BoardListDTO> getListsByBoardId(Long boardId) {
        return boardListRepo.findByBoardIdOrderByPositionAsc(boardId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Create a new list; auto-assigns the next position at the end
    public BoardListDTO createList(BoardListDTO dto, Long userId) {
        int nextPosition = boardListRepo
                .findMaxPositionByBoardId(dto.getBoardId())
                .map(max -> max + 1)
                .orElse(0);

        BoardList list = BoardList.builder()
                .boardId(dto.getBoardId())
                .name(dto.getName())
                .position(nextPosition)
                .build();

        BoardList saved = boardListRepo.save(list);

        WorkspaceDTO workspace = workspaceClient.getWorkspaceByBoardId(dto.getBoardId());
        activityService.createActivity(
                userId,
                workspace.getId(),
                saved.getBoardId(),
                saved.getId(),
                null,
                ActivityType.LIST_CREATED,
                "created list \"" + saved.getName() + "\"",
                null);
        notificationEventPublisher.publish(
                buildNotificationEvent(
                        userId,
                        workspace,
                        getBoard(saved.getBoardId()),
                        NotificationType.LIST_CREATED,
                        "New list created",
                        "User " + userId +
                                " created list \"" + saved.getName() + "\""));

        log.info("Created list '{}' at position {} for board {}", saved.getName(), saved.getPosition(),
                saved.getBoardId());
        return toDTO(saved);
    }

    // Update the name (and optionally position) of a list
    public BoardListDTO updateList(Long id, BoardListDTO dto, Long userId) {
        BoardList list = boardListRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found: " + id));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            list.setName(dto.getName());
        }

        BoardList updated = boardListRepo.save(list);

        WorkspaceDTO workspace = workspaceClient.getWorkspaceByBoardId(list.getBoardId());
        activityService.createActivity(
                userId,
                workspace.getId(),
                updated.getBoardId(),
                updated.getId(),
                null,
                ActivityType.LIST_UPDATED,
                "Updated list \"" + updated.getName() + "\"",
                null);

        notificationEventPublisher.publish(
                buildNotificationEvent(
                        userId,
                        workspace,
                        getBoard(updated.getBoardId()),
                        NotificationType.LIST_UPDATED,
                        "List updated",
                        "User " + userId +
                                " updated list \"" + updated.getName() + "\""));
        log.info("Updated list id={}", id);
        return toDTO(updated);
    }

    // Delete a list and all its cards (cascaded manually since entities are in the
    // same service)
    @Transactional
    public void deleteList(Long id, Long userId) {
        BoardList list = boardListRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found: " + id));

        Long boardId = list.getBoardId();
        String listName = list.getName();
        // Remove all cards belonging to this list first
        WorkspaceDTO workspace = workspaceClient.getWorkspaceByBoardId(list.getBoardId());
        activityService.createActivity(
                userId,
                workspace.getId(),
                list.getBoardId(),
                list.getId(),
                null,
                ActivityType.LIST_DELETED,
                "Deleted list \"" + list.getName() + "\"",
                null);
        cardRepo.deleteByListId(id);
        boardListRepo.delete(list);
        notificationEventPublisher.publish(
                buildNotificationEvent(
                        userId,
                        workspace,
                        getBoard(boardId),
                        NotificationType.LIST_DELETED,
                        "List deleted",
                        "User " + userId +
                                " deleted list \"" + listName + "\""));

        log.info("Deleted list id={} and its cards", id);
    }

    // Move a list to a new position, shifting siblings accordingly
    @Transactional
    public BoardListDTO reorderList(Long id, int newPosition, Long userId) {
        BoardList list = boardListRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found: " + id));

        List<BoardList> siblings = boardListRepo.findByBoardIdOrderByPositionAsc(list.getBoardId());
        int sourceIndex = siblings.stream()
                .map(BoardList::getId)
                .toList()
                .indexOf(id);
        if (sourceIndex < 0) {
            throw new EntityNotFoundException("List not found in board: " + id);
        }
        int targetIndex = Math.max(0, Math.min(newPosition, siblings.size() - 1));
        if (sourceIndex == targetIndex) {
            return toDTO(list);
        }

        siblings.remove(sourceIndex);
        siblings.add(targetIndex, list);

        int temporaryStart = siblings.stream()
                .mapToInt(BoardList::getPosition)
                .max()
                .orElse(0) + siblings.size() + 1;
        for (int index = 0; index < siblings.size(); index++) {
            siblings.get(index).setPosition(temporaryStart + index);
        }
        boardListRepo.saveAllAndFlush(siblings);

        for (int index = 0; index < siblings.size(); index++) {
            siblings.get(index).setPosition(index);
        }
        boardListRepo.saveAll(siblings);
        WorkspaceDTO workspace = workspaceClient.getWorkspaceByBoardId(list.getBoardId());
        activityService.createActivity(
                userId,
                workspace.getId(),
                list.getBoardId(),
                list.getId(),
                null,
                ActivityType.LIST_MOVED,
                "Moved list \"" + list.getName() + "\"",
                null);
        notificationEventPublisher.publish(
                buildNotificationEvent(
                        userId,
                        workspace,
                        getBoard(list.getBoardId()),
                        NotificationType.LIST_MOVED,
                        "List moved",
                        "User " + userId +
                                " moved list \"" + list.getName() + "\""));
        log.info("Reordered list id={} to position {}", id, targetIndex);
        return toDTO(list);
    }

    private NotificationEvent buildNotificationEvent(
            Long userId,
            WorkspaceDTO workspace,
            BoardDTO board,
            NotificationType type,
            String title,
            String message) {
        UserDTO actor = authClient.getProfile(userId);
        return NotificationEvent.builder()
                .actorId(userId)
                .actorName(actor.getName())
                .actorAvatar(actor.getAvatar())
                .workspaceId(workspace.getId())
                .workspaceName(workspace.getName())
                .boardId(board != null ? board.getId() : null)
                .boardName(board != null ? board.getName() : null)
                .type(type)
                .title(title)
                .message(message)
                .recipientIds(workspaceClient.getWorkspaceMemberIds(workspace.getId()))
                .build();
    }

    private BoardDTO getBoard(Long boardId) {
        return workspaceClient.getBoardsByBoardsId(List.of(boardId))
                .stream()
                .findFirst()
                .orElse(null);
    }

    // Helper: convert entity to DTO
    private BoardListDTO toDTO(BoardList list) {
        return BoardListDTO.builder()
                .id(list.getId())
                .boardId(list.getBoardId())
                .name(list.getName())
                .position(list.getPosition())
                .createdAt(list.getCreatedAt())
                .updatedAt(list.getUpdatedAt())
                .build();
    }
}
