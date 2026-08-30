package com.server.taskservice.service;

import com.server.taskservice.dto.BoardListDTO;
import com.server.taskservice.model.BoardList;
import com.server.taskservice.repository.BoardListRepo;
import com.server.taskservice.repository.CardRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Service for managing Trello-style lists within a board
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardListService {

    private final BoardListRepo boardListRepo;
    private final CardRepo cardRepo;

    // Fetch all lists for a board, already ordered by position
    public List<BoardListDTO> getListsByBoardId(Long boardId) {
        return boardListRepo.findByBoardIdOrderByPositionAsc(boardId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Create a new list; auto-assigns the next position at the end
    public BoardListDTO createList(BoardListDTO dto) {
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
        log.info("Created list '{}' at position {} for board {}", saved.getName(), saved.getPosition(), saved.getBoardId());
        return toDTO(saved);
    }

    // Update the name (and optionally position) of a list
    public BoardListDTO updateList(Long id, BoardListDTO dto) {
        BoardList list = boardListRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found: " + id));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            list.setName(dto.getName());
        }
        if (dto.getPosition() != null) {
            list.setPosition(dto.getPosition());
        }

        BoardList updated = boardListRepo.save(list);
        log.info("Updated list id={}", id);
        return toDTO(updated);
    }

    // Delete a list and all its cards (cascaded manually since entities are in the same service)
    @Transactional
    public void deleteList(Long id) {
        BoardList list = boardListRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found: " + id));

        // Remove all cards belonging to this list first
        cardRepo.deleteByListId(id);
        boardListRepo.delete(list);
        log.info("Deleted list id={} and its cards", id);
    }

    // Move a list to a new position, shifting siblings accordingly
    @Transactional
    public BoardListDTO reorderList(Long id, int newPosition) {
        BoardList list = boardListRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found: " + id));

        int oldPosition = list.getPosition();
        if (oldPosition == newPosition) {
            return toDTO(list);
        }

        List<BoardList> siblings = boardListRepo.findByBoardIdOrderByPositionAsc(list.getBoardId());

        // Shift siblings to make room for the new position
        for (BoardList sibling : siblings) {
            if (sibling.getId().equals(id)) continue;

            int pos = sibling.getPosition();
            if (oldPosition < newPosition && pos > oldPosition && pos <= newPosition) {
                sibling.setPosition(pos - 1);
                boardListRepo.save(sibling);
            } else if (oldPosition > newPosition && pos >= newPosition && pos < oldPosition) {
                sibling.setPosition(pos + 1);
                boardListRepo.save(sibling);
            }
        }

        list.setPosition(newPosition);
        BoardList updated = boardListRepo.save(list);
        log.info("Reordered list id={} from position {} to {}", id, oldPosition, newPosition);
        return toDTO(updated);
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
