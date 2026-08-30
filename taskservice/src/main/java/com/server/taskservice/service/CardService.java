package com.server.taskservice.service;

import com.server.taskservice.dto.CardDTO;
import com.server.taskservice.model.Card;
import com.server.taskservice.repository.CardRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Service for managing Trello-style cards within a list
@Slf4j
@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepo cardRepo;

    // Fetch all cards for a list, already ordered by position
    public List<CardDTO> getCardsByListId(Long listId) {
        return cardRepo.findByListIdOrderByPositionAsc(listId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Create a new card; auto-assigns the next position at the end of the list
    public CardDTO createCard(CardDTO dto) {
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

        Card saved = cardRepo.save(card);
        log.info("Created card '{}' at position {} in list {}", saved.getTitle(), saved.getPosition(), saved.getListId());
        return toDTO(saved);
    }

    // Update card fields (title, description, dueDate, assignedTo, position)
    public CardDTO updateCard(Long id, CardDTO dto) {
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
        if (dto.getAssignedTo() != null) {
            card.setAssignedTo(dto.getAssignedTo());
        }
        if (dto.getPosition() != null) {
            card.setPosition(dto.getPosition());
        }

        Card updated = cardRepo.save(card);
        log.info("Updated card id={}", id);
        return toDTO(updated);
    }

    // Delete a card by id
    public void deleteCard(Long id) {
        if (!cardRepo.existsById(id)) {
            throw new EntityNotFoundException("Card not found: " + id);
        }
        cardRepo.deleteById(id);
        log.info("Deleted card id={}", id);
    }

    // Move a card to a target list at a specific position, reordering both source and target lists
    @Transactional
    public CardDTO moveCard(Long cardId, Long targetListId, int newPosition) {
        Card card = cardRepo.findById(cardId)
                .orElseThrow(() -> new EntityNotFoundException("Card not found: " + cardId));

        Long sourceListId = card.getListId();
        int oldPosition = card.getPosition();

        boolean isSameList = sourceListId.equals(targetListId);

        if (isSameList) {
            // Reorder within the same list
            List<Card> siblings = cardRepo.findByListIdOrderByPositionAsc(sourceListId);
            for (Card sibling : siblings) {
                if (sibling.getId().equals(cardId)) continue;
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
                if (sibling.getId().equals(cardId)) continue;
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
        log.info("Moved card id={} to list {} at position {}", cardId, targetListId, newPosition);
        return toDTO(moved);
    }

    // Helper: convert entity to DTO
    private CardDTO toDTO(Card card) {
        return CardDTO.builder()
                .id(card.getId())
                .listId(card.getListId())
                .title(card.getTitle())
                .description(card.getDescription())
                .position(card.getPosition())
                .assignedTo(card.getAssignedTo())
                .dueDate(card.getDueDate())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}
