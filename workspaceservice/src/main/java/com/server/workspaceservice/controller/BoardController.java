package com.server.workspaceservice.controller;

import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/api/board")
public class BoardController {


    private final BoardService boardService;

    //Endpoint to fetch boards using workspaceId
    @GetMapping("/{id}")
    public ResponseEntity<List<BoardDTO>> getBoardsByWorkspaceId(@PathVariable Long id) {
        List<BoardDTO> boards = boardService.getBoardsByWorkspaceId(id);
        return ResponseEntity.ok(boards);
    }
}
