package com.server.workspaceservice.controller;

import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.model.Board;
import com.server.workspaceservice.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/board")
public class BoardController {


    private final BoardService boardService;

    //Endpoint to fetch boards using workspaceId
    @GetMapping("/{workspaceId}")
    public ResponseEntity<List<BoardDTO>> getBoardsByWorkspaceId(@PathVariable Long workspaceId) {
        List<BoardDTO> boards = boardService.getBoardsByWorkspaceId(workspaceId);
        return ResponseEntity.ok(boards);
    }

    //    Endpoint to create board
    @PostMapping("/create")
    public ResponseEntity<BoardDTO> createBoard(@AuthenticationPrincipal Jwt jwt, @RequestBody BoardDTO boardDTO) {
        Long userId = jwt.getClaim("userId");
        BoardDTO boardDTO1 = boardService.createBoard(boardDTO, userId);
        return new ResponseEntity<>(boardDTO1, HttpStatus.CREATED);

    }

}
