package com.server.workspaceservice.service;

import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.repository.BoardRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

//Service for the management of workspaces
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepo boardRepo;

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
}
