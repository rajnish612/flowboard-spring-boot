package com.server.taskservice.controller;

import com.server.taskservice.dto.BoardListDTO;
import com.server.taskservice.service.BoardListService;
import com.server.taskservice.websocket.BoardEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Handles HTTP requests for board lists (Trello columns)
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/list")
public class BoardListController {

    private final BoardEventPublisher boardEventPublisher;
    private final BoardListService boardListService;

    // GET /list/{boardId} — fetch all lists for a board
    @PreAuthorize(
            "@taskAuthorization.hasBoardAccess(#boardId, authentication)"
    )
    @GetMapping("/{boardId}")
    public ResponseEntity<List<BoardListDTO>> getListsByBoardId(@PathVariable Long boardId) {
        log.info("Fetching lists for board {}", boardId);
        return ResponseEntity.ok(boardListService.getListsByBoardId(boardId));
    }

    // POST /list/create — create a new list
    @PreAuthorize(
            "@taskAuthorization.hasBoardAccess(#dto.boardId, authentication)"
    )
    @PostMapping("/create")
    public ResponseEntity<BoardListDTO> createList(@RequestBody BoardListDTO dto, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");
        BoardListDTO created = boardListService.createList(dto, userId);

        boardEventPublisher.publish(userId, "LIST_CREATED", dto.getBoardId(), created);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /list/{id} — update list name / position
    @PreAuthorize(
            "@taskAuthorization.hasListAccess(#id, authentication)"
    )
    @PutMapping("/{id}")
    public ResponseEntity<BoardListDTO> updateList(@PathVariable Long id, @RequestBody BoardListDTO dto, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");

        BoardListDTO updated = boardListService.updateList(id, dto, userId);

        boardEventPublisher.publish(userId, "LIST_UPDATED", updated.getBoardId(), updated);
        return ResponseEntity.ok(updated);
    }

    // DELETE /list/{id} — delete a list and all its cards
    @PreAuthorize(
            "@taskAuthorization.hasListAccess(#id, authentication)"
    )
    @DeleteMapping("/{id}/{boardId}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id, @PathVariable Long boardId, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");

        boardListService.deleteList(id, userId);

        boardEventPublisher.publish(userId, "LIST_DELETED", boardId, id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /list/{id}/reorder — move a list to a new position
    @RequestMapping(value = "/{id}/reorder", method = {RequestMethod.PATCH, RequestMethod.POST})
    @PreAuthorize(
            "@taskAuthorization.hasListAccess(#id, authentication)"
    )
    public ResponseEntity<BoardListDTO> reorderList(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body, @AuthenticationPrincipal Jwt jwt) {
        Integer newPosition = body.get("position");
        if (newPosition == null) {
            return ResponseEntity.badRequest().build();
        }
        Long userId = jwt.getClaim("userId");
        BoardListDTO reordered = boardListService.reorderList(id, newPosition, userId);

        boardEventPublisher.publish(userId, "LIST_REORDERED", reordered.getBoardId(), reordered);
        return ResponseEntity.ok(reordered);
    }
}
