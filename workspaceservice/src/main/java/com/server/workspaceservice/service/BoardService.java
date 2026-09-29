package com.server.workspaceservice.service;

import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.model.Board;
import com.server.workspaceservice.repository.BoardRepo;
import com.server.workspaceservice.repository.WorkSpaceRepo;
import com.server.workspaceservice.repository.WorkspaceMemberRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import org.springframework.security.access.AccessDeniedException;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;

//Service for the management of workspaces
@Slf4j
@Service
@RequiredArgsConstructor
public class BoardService {

        private final BoardRepo boardRepo;
        private final WorkSpaceRepo workSpaceRepo;
        private final WorkspaceMemberRepo workspaceMemberRepo;

        // Method to get boards by workspace id
        public List<BoardDTO> getBoardsByWorkspaceId(Long workspaceId) {
                log.info("Fetching boards for workspaceId: {}", workspaceId);

                List<BoardDTO> result = boardRepo.findBoardsByWorkspaceId(workspaceId)
                                .stream()
                                .map(b -> BoardDTO
                                                .builder()
                                                .id(b.getId())
                                                .workspaceId(b.getWorkspaceId())
                                                .name(b.getName())
                                                .description(b.getDescription())
                                                .backgroundImage(b.getBackgroundImage())
                                                .build())
                                .toList();
                if (result.isEmpty()) {
                        log.debug("No boards found for workspaceId={}", workspaceId);
                        return List.of();
                }
                log.info("Fetched {} boards for workspaceId: {}", result.size(), workspaceId);
                return result;
        }

        // Method to fetch board using board id
        public BoardDTO getBoardById(Long boardId, Long userId) {
                log.info("Fetching board: boardId={}, userId={}", boardId, userId);

                Board board = boardRepo.findById(boardId)
                                .orElseThrow(() -> new EntityNotFoundException("Board not found: " + boardId));

                if (!hasUserAccessToBoard(boardId, userId)) {
                        log.warn("Unauthorized board access attempt: boardId={}, userId={}",
                                        boardId, userId);
                        throw new AccessDeniedException("You are not authorized to access this board");
                }

                BoardDTO boardDTO = BoardDTO.builder()
                                .id(board.getId())
                                .workspaceId(board.getWorkspaceId())
                                .name(board.getName())
                                .description(board.getDescription())
                                .backgroundImage(board.getBackgroundImage())
                                .createdAt(board.getCreatedAt())
                                .updatedAt(board.getUpdatedAt())
                                .build();
                log.info("Board fetched successfully: boardId={}, userId={}",
                                boardId, userId);
                return boardDTO;
        }

        // Method to fetch board using board id
        public List<BoardDTO> getBoardsByIds(List<Long> boardIds) {
                log.info("fetching boards for {} ids", boardIds.size());

                List<BoardDTO> result = boardRepo.findAllById(boardIds).stream().map(board -> BoardDTO.builder()
                                .name(board.getName())
                                .description(board.getDescription()).backgroundImage(board.getBackgroundImage())
                                .workspaceId(board.getWorkspaceId()).id(board.getId()).createdAt(board.getCreatedAt())
                                .build()).toList();
                if (result.isEmpty()) {
                        log.info("No boards found for {} ids", boardIds.size());

                        return List.of();
                }
                log.info("{} Boards fetched for {} ids", result.size(), boardIds.size());
                return result;
        }

        // Method to create new board
        public BoardDTO createBoard(BoardDTO boardDTO, Long userId) {
                log.info("creating board {} for workspace with id: {} ", boardDTO.getName(), boardDTO.getWorkspaceId());

                boolean isOwner = workSpaceRepo.checkIsOwner(
                                userId,
                                boardDTO.getWorkspaceId()); // First check if the user is owner of the workspace or not

                if (!isOwner) {
                        log.warn("Unauthorized board creation attempt: workspaceId={}, userId={}",
                                        boardDTO.getWorkspaceId(), userId);

                        throw new AccessDeniedException(
                                        "You are not authorized to create a board in this workspace");
                } // if not, then not allowed to create board
                Board newBoard = Board.builder()
                                .name(boardDTO.getName())
                                .description(boardDTO.getDescription())
                                .backgroundImage(boardDTO.getBackgroundImage())
                                .workspaceId(boardDTO.getWorkspaceId())
                                .build();

                Board boardCreated = boardRepo.save(newBoard);
                log.info("Board created successfully: boardId={}, workspaceId={}, userId={}",
                                boardCreated.getId(),
                                boardCreated.getWorkspaceId(),
                                userId);
                return BoardDTO.builder()
                                .id(boardCreated.getId())
                                .name(boardCreated.getName())
                                .description(boardCreated.getDescription())
                                .backgroundImage(boardCreated.getBackgroundImage())
                                .workspaceId(boardCreated.getWorkspaceId())
                                .build();

        }

        // Method to check if user has the access to board or not using board and user
        // Id
        public boolean hasUserAccessToBoard(Long boardId, Long userId) {

                Board board = boardRepo.findById(boardId)
                                .orElseThrow(() -> new EntityNotFoundException("Board not found: " + boardId));

                Long workspaceId = board.getWorkspaceId();

                boolean isOwner = workSpaceRepo.existsByIdAndOwnerId(
                                workspaceId,
                                userId);// Check if user is owner

                boolean isMember = workspaceMemberRepo.existsByWorkspaceIdAndUserId(
                                workspaceId,
                                userId);// Check if user is the member

                return isOwner || isMember;
        }
}
