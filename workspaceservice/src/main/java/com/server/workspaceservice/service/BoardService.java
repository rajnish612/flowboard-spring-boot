package com.server.workspaceservice.service;

import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.model.Board;
import com.server.workspaceservice.repository.BoardRepo;
import com.server.workspaceservice.repository.WorkSpaceRepo;
import com.server.workspaceservice.repository.WorkspaceMemberRepo;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import org.springframework.security.access.AccessDeniedException;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;

//Service for the management of workspaces
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepo boardRepo;
    private final WorkSpaceRepo workSpaceRepo;
    private final WorkspaceMemberRepo workspaceMemberRepo;

    //Method to get boards by workspace id
    public List<BoardDTO> getBoardsByWorkspaceId(Long workspaceId) {
        return boardRepo.findBoardsByWorkspaceId(workspaceId)
                .stream()
                .map(b -> BoardDTO
                        .builder()
                        .id(b.getId())
                        .workspaceId(b.getWorkspaceId())
                        .name(b.getName())
                        .backgroundImage(b.getBackgroundImage())
                        .build()).toList();
    }

    //Method to fetch board using board id
    public BoardDTO getBoardById(Long boardId, Long userId) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("Board not found: " + boardId));

        if (!hasUserAccessToBoard(boardId, userId)) {
            throw new AccessDeniedException("You are not authorized to access this board");
        }

        return BoardDTO.builder()
                .id(board.getId())
                .workspaceId(board.getWorkspaceId())
                .name(board.getName())
                .description(board.getDescription())
                .backgroundImage(board.getBackgroundImage())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }

    //Method to create new board
    public BoardDTO createBoard(BoardDTO boardDTO, Long userId) {
        boolean isOwner = workSpaceRepo.checkIsOwner(
                userId,
                boardDTO.getWorkspaceId()
        ); //First check if the user is owner of the workspace or not

        if (!isOwner) {
            throw new AccessDeniedException(
                    "You are not authorized to create a board in this workspace"
            );
        } //if not, then not allowed to create board
        Board newBoard = Board.builder()
                .name(boardDTO.getName())
                .description(boardDTO.getDescription())
                .backgroundImage(boardDTO.getBackgroundImage())
                .workspaceId(boardDTO.getWorkspaceId())
                .build();

        boardRepo.save(newBoard);
        return boardDTO;

    }

    //Method to check if user has the access to board or not using board and user Id
    public boolean hasUserAccessToBoard(Long boardId, Long userId) {

        Board board = boardRepo.findById(boardId)
                .orElseThrow(() ->
                        new RuntimeException("Board not found"));

        Long workspaceId = board.getWorkspaceId();

        boolean isOwner =
                workSpaceRepo.existsByIdAndOwnerId(
                        workspaceId,
                        userId
                );//Check if user is owner

        boolean isMember =
                workspaceMemberRepo.existsByWorkspaceIdAndUserId(
                        workspaceId,
                        userId
                );//Check if user is the member 

        return isOwner || isMember;
    }
}
