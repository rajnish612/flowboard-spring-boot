package com.server.workspaceservice.service;

import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.model.Board;
import com.server.workspaceservice.repository.BoardRepo;
import com.server.workspaceservice.repository.WorkSpaceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.security.access.AccessDeniedException;

import java.util.List;

//Service for the management of workspaces
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepo boardRepo;
    private final WorkSpaceRepo workSpaceRepo;

    //Method to get boards by workspace id
    public List<BoardDTO> getBoardsByWorkspaceId(Long workspaceId) {
        return boardRepo.findBoardsByWorkspaceId(workspaceId)
                .stream()
                .map(b -> BoardDTO
                        .builder()
                        .id(b.getId())
                        .workspaceId(b.getWorkspaceId())
                        .name(b.getName())
                        .build()).toList();
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
                .workspaceId(boardDTO.getWorkspaceId())
                .createdBy(userId)
                .build();

        boardRepo.save(newBoard);
        return boardDTO;
    }
}
