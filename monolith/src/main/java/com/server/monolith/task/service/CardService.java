package com.server.monolith.task.service;


import com.server.monolith.auth.dto.UserDTO;
import com.server.monolith.auth.service.UserService;
import com.server.monolith.notification.dto.NotificationEvent;
import com.server.monolith.notification.entity.NotificationType;
import com.server.monolith.notification.service.NotificationService;
import com.server.monolith.task.dto.*;
import com.server.monolith.task.model.ActivityType;
import com.server.monolith.task.model.BoardList;
import com.server.monolith.task.model.Card;
import com.server.monolith.task.repository.BoardListRepo;
import com.server.monolith.task.repository.CardRepo;
import com.server.monolith.workspace.dto.BoardDTO;
import com.server.monolith.workspace.dto.WorkspaceDTO;
import com.server.monolith.workspace.service.BoardService;
import com.server.monolith.workspace.service.WorkspaceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

// Service for managing Trello-style cards within a list
@Slf4j
@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepo cardRepo;
    private final BoardListRepo boardListRepo;
    private final ActivityService activityService;
    private final WorkspaceService workspaceService;
    private final BoardService boardService;
    private final UserService userService;
    private final NotificationService notificationService;

    // Fetch all cards for a list, already ordered by position
    public List<CardDTO> getCardsByListId(Long listId) {
        List<Card> cards = cardRepo.findByListIdOrderByPositionAsc(listId);
        //
        List<Long> userIds = cards.stream()
                .map(Card::getAssignedTo)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, UserDTO> profiles = userService.getUsersByIds(userIds)
                .stream()
                .collect(Collectors.toMap(
                        UserDTO::getId,
                        Function.identity()));
        return cards.stream()
                .map(card -> {

                    CardDTO dto = toDTO(card);

                    if (card.getAssignedTo() != null) {
                        UserDTO profile = profiles.get(card.getAssignedTo());

                        if (profile != null) {
                            dto.setAssignedToAvatar(profile.getAvatar());
                            dto.setAssignedToName(profile.getName());
                        }
                    }

                    return dto;
                })
                .toList();
    }

    // Create a new card; auto-assigns the next position at the end of the list
    public CardDTO createCard(CardDTO dto, Long userId) {
        int nextPosition = cardRepo
                .findMaxPositionByListId(dto.getListId())
                .map(max -> max + 1)
                .orElse(0);

        Card card = Card.builder()
                .listId(dto.getListId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .position(nextPosition)
                .assignedTo(dto.getAssignedTo())
                .dueDate(dto.getDueDate())
                .build();
        BoardList list = boardListRepo.findById(card.getListId())
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        Long boardId = list.getBoardId();
        WorkspaceDTO workspace = workspaceService.getWorkspaceByBoardId(list.getBoardId());

        BoardDTO board = getBoard(boardId);
        Card saved = cardRepo.save(card);

        activityService.createActivity(
                userId,
                workspace.getId(),
                list.getBoardId(),
                list.getId(),
                saved.getId(),
                ActivityType.CARD_CREATED,
                "Card created \"" + saved.getTitle() + "\"",
                null);
        notificationService.processNotificationEvent(buildNotificationEvent(userId, workspace, board, NotificationType.CARD_CREATED, "Card created", "Created card \"" + saved.getTitle() + "\""));

        log.info("Created card '{}' at position {} in list {}", saved.getTitle(), saved.getPosition(),
                saved.getListId());
        return toDTO(saved);
    }

    // Update card fields (title, description, dueDate, assignedTo, position)
    public CardDTO updateCard(Long id, CardDTO dto, Long userId) {
        Card card = cardRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Card not found: " + id));

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            card.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            card.setDescription(dto.getDescription());
        }
        if (dto.getDueDate() != null) {
            card.setDueDate(dto.getDueDate());
        }
        Long oldAssignedTo = card.getAssignedTo();

        card.setAssignedTo(dto.getAssignedTo());
        if (dto.getPosition() != null) {
            card.setPosition(dto.getPosition());
        }

        BoardList list = boardListRepo.findById(card.getListId())
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        WorkspaceDTO workspace = workspaceService.getWorkspaceByBoardId(list.getBoardId());
        BoardDTO board = getBoard(list.getBoardId());
        Card updated = cardRepo.save(card);

        if (!Objects.equals(oldAssignedTo, updated.getAssignedTo())) {

            if (updated.getAssignedTo() == null) {
                UserDTO unassignedUser = userService.getUserById(oldAssignedTo);
                activityService.createActivity(
                        userId,
                        workspace.getId(),
                        list.getBoardId(),
                        list.getId(),
                        updated.getId(),
                        ActivityType.CARD_UNASSIGNED,
                        "unassigned card \"" + updated.getTitle() + "\" from " + unassignedUser.getName(),
                        oldAssignedTo);
                notificationService.processNotificationEvent(buildNotificationEvent(userId, workspace, board, NotificationType.CARD_UNASSIGNED, "Card unassigned", "unassigned card \"" + updated.getTitle() + "\" from \"" + unassignedUser.getName() + "\""));

            } else {

                UserDTO assignedUser = userService.getUserById(updated.getAssignedTo());

                activityService.createActivity(
                        userId,
                        workspace.getId(),
                        list.getBoardId(),
                        list.getId(),
                        updated.getId(),
                        ActivityType.CARD_ASSIGNED,
                        "assigned card \"" +
                                updated.getTitle() +
                                "\" to " +
                                assignedUser.getName(),
                        updated.getAssignedTo());
                notificationService.processNotificationEvent(buildNotificationEvent(userId, workspace, board, NotificationType.CARD_ASSIGNED, "Card assigned", "assigned card \"" + updated.getTitle() + "\" to \"" + assignedUser.getName() + "\""));


            }

        } else {
            activityService.createActivity(
                    userId,
                    workspace.getId(),
                    list.getBoardId(),
                    list.getId(),
                    updated.getId(),
                    ActivityType.CARD_UPDATED,
                    "Updated card \"" + updated.getTitle() + "\"",
                    null);
            notificationService.processNotificationEvent(buildNotificationEvent(userId, workspace, board, NotificationType.CARD_UPDATED, "Card updated", "Card updated \"" + updated.getTitle() + "\""));

        }
        log.info("Updated card id = {}", id);
        return toDTO(updated);
    }

    // Delete a card by id
    public void deleteCard(Long id, Long userId) {
        Card card = cardRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Card not found: " + id));

        BoardList list = boardListRepo.findById(card.getListId())
                .orElseThrow(() -> new EntityNotFoundException("List not found"));
        BoardDTO board = getBoard(list.getBoardId());
        WorkspaceDTO workspace = workspaceService.getWorkspaceByBoardId(list.getBoardId());
        activityService.createActivity(
                userId,
                workspace.getId(),
                list.getBoardId(),
                list.getId(),
                id,
                ActivityType.CARD_DELETED,
                "Card deleted \"" + card.getTitle() + "\"",
                null);

        cardRepo.deleteById(id);
        notificationService.processNotificationEvent(buildNotificationEvent(userId, workspace, board, NotificationType.CARD_DELETED, "Card deleted", "Card deleted \"" + card.getTitle() + "\""));

        log.info("Deleted card id={}", id);
    }

    // Move a card to a target list at a specific position, reordering both source
    // and target lists
    @Transactional
    public CardDTO moveCard(Long cardId, Long targetListId, int newPosition, Long userId) {
        Card card = cardRepo.findById(cardId)
                .orElseThrow(() -> new EntityNotFoundException("Card not found: " + cardId));

        Long sourceListId = card.getListId();
        int oldPosition = card.getPosition();
        BoardList targetList = boardListRepo.findById(targetListId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Target list not found: " + targetListId));
        BoardDTO board = getBoard(targetList.getBoardId());
        BoardList sourceList = boardListRepo.findById(sourceListId).orElseThrow(
                () -> new EntityNotFoundException("Source list not found: " + sourceListId));
        boolean isSameList = sourceListId.equals(targetListId);

        if (isSameList) {
            // Reorder within the same list
            List<Card> siblings = cardRepo.findByListIdOrderByPositionAsc(sourceListId);
            for (Card sibling : siblings) {
                if (sibling.getId().equals(cardId))
                    continue;
                int pos = sibling.getPosition();
                if (oldPosition < newPosition && pos > oldPosition && pos <= newPosition) {
                    sibling.setPosition(pos - 1);
                    cardRepo.save(sibling);
                } else if (oldPosition > newPosition && pos >= newPosition && pos < oldPosition) {
                    sibling.setPosition(pos + 1);
                    cardRepo.save(sibling);
                }
            }
        } else {
            // Moving to a different list:
            // 1. Collapse gap in the source list
            List<Card> sourceCards = cardRepo.findByListIdOrderByPositionAsc(sourceListId);
            for (Card sibling : sourceCards) {
                if (sibling.getId().equals(cardId))
                    continue;
                if (sibling.getPosition() > oldPosition) {
                    sibling.setPosition(sibling.getPosition() - 1);
                    cardRepo.save(sibling);
                }
            }

            // 2. Open up space in the target list
            List<Card> targetCards = cardRepo.findByListIdOrderByPositionAsc(targetListId);
            for (Card sibling : targetCards) {
                if (sibling.getPosition() >= newPosition) {
                    sibling.setPosition(sibling.getPosition() + 1);
                    cardRepo.save(sibling);
                }
            }

            // 3. Move the card
            card.setListId(targetListId);
        }

        card.setPosition(newPosition);

        Card moved = cardRepo.save(card);

        String message;

        if (isSameList) {
            message = "moved card \""
                    + moved.getTitle()
                    + "\" to position "
                    + newPosition;
        } else {
            message = "moved card \""
                    + moved.getTitle()
                    + "\" from \""
                    + sourceList.getName()
                    + "\" to \""
                    + targetList.getName()
                    + "\"";
        }
        WorkspaceDTO workspace = workspaceService.getWorkspaceByBoardId(targetList.getBoardId());
        activityService.createActivity(
                userId,
                workspace.getId(),
                targetList.getBoardId(),
                targetList.getId(),
                moved.getId(),
                ActivityType.CARD_MOVED,
                message,
                null);
        notificationService.processNotificationEvent(buildNotificationEvent(userId, workspace, board, NotificationType.CARD_ASSIGNED, "Card moved", message));

        log.info("Moved card id={} to list {} at position {}", cardId, targetListId, newPosition);
        return toDTO(moved);
    }

    // Helper: convert entity to DTO
    private CardDTO toDTO(Card card) {
        CardDTO.CardDTOBuilder builder = CardDTO.builder()
                .id(card.getId())
                .listId(card.getListId())
                .title(card.getTitle())
                .description(card.getDescription())
                .position(card.getPosition())
                .assignedTo(card.getAssignedTo())
                .dueDate(card.getDueDate())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt());

        if (card.getAssignedTo() != null) {
            UserDTO user = userService.getUserById(card.getAssignedTo());

            builder
                    .assignedToName(user.getName())
                    .assignedToEmail(user.getEmail())
                    .assignedToAvatar(user.getAvatar());

        }

        return builder.build();
    }


    //Notification Event DTO builder for notifications
    private NotificationEvent buildNotificationEvent(
            Long userId,
            WorkspaceDTO workspace,
            BoardDTO board,
            NotificationType type,
            String title,
            String message) {
        UserDTO actor = userService.getUserById(userId);
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
                .message("User " + actor.getName() + " " + message)
                .recipientIds(workspaceService.getWorkspaceMemberIds(workspace.getId()))
                .build();
    }

    private BoardDTO getBoard(Long boardId) {
        return boardService.getBoardsByIds(List.of(boardId))
                .stream()
                .findFirst()
                .orElse(null);
    }

}
