package com.server.workspaceservice.controller;

import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.dto.WorkspaceDTO;
import com.server.workspaceservice.model.Board;
import com.server.workspaceservice.service.BoardService;
import com.server.workspaceservice.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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


    private static final Logger log = LoggerFactory.getLogger(BoardController.class);
    private final BoardService boardService;
    private final WorkspaceService workspaceService;

    //Endpoint to fetch boards using workspaceId
    @GetMapping("/{workspaceId}")
    public ResponseEntity<List<BoardDTO>> getBoardsByWorkspaceId(@PathVariable Long workspaceId) {
        List<BoardDTO> boards = boardService.getBoardsByWorkspaceId(workspaceId);
        return ResponseEntity.ok(boards);
    }



    //Endpoint to fetch board using boardId
    @GetMapping("/detail/{boardId}")
    public ResponseEntity<BoardDTO> getBoardById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long boardId) {
        Long userId = jwt.getClaim("userId");
        return ResponseEntity.ok(boardService.getBoardById(boardId, userId));
    }


    //Endpoint to check if the user has access to board or not using board and user Id
    @GetMapping("/{boardId}/access")
    public ResponseEntity<Boolean> hasBoardAccess(
            @PathVariable Long boardId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                boardService.hasUserAccessToBoard(boardId, userId)
        );
    }

    //    Endpoint to create board
    @PostMapping("/create")
    public ResponseEntity<BoardDTO> createBoard(@AuthenticationPrincipal Jwt jwt, @RequestBody BoardDTO boardDTO) {
        Long userId = jwt.getClaim("userId");
        BoardDTO boardDTO1 = boardService.createBoard(boardDTO, userId);
        return new ResponseEntity<>(boardDTO1, HttpStatus.CREATED);

    }

}
