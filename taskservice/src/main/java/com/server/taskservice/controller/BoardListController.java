package com.server.taskservice.controller;

import com.server.taskservice.dto.BoardListDTO;
import com.server.taskservice.service.BoardListService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Handles HTTP requests for board lists (Trello columns)
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/list")
public class BoardListController {

    private final BoardListService boardListService;

    // GET /list/{boardId} — fetch all lists for a board
    @GetMapping("/{boardId}")
    public ResponseEntity<List<BoardListDTO>> getListsByBoardId(@PathVariable Long boardId) {
        log.info("Fetching lists for board {}", boardId);
        return ResponseEntity.ok(boardListService.getListsByBoardId(boardId));
    }

    // POST /list/create — create a new list
    @PostMapping("/create")
    public ResponseEntity<BoardListDTO> createList(@RequestBody BoardListDTO dto) {
        BoardListDTO created = boardListService.createList(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /list/{id} — update list name / position
    @PutMapping("/{id}")
    public ResponseEntity<BoardListDTO> updateList(@PathVariable Long id, @RequestBody BoardListDTO dto) {
        BoardListDTO updated = boardListService.updateList(id, dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /list/{id} — delete a list and all its cards
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(@PathVariable Long id) {
        boardListService.deleteList(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /list/{id}/reorder — move a list to a new position
    @PatchMapping("/{id}/reorder")
    public ResponseEntity<BoardListDTO> reorderList(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer newPosition = body.get("position");
        if (newPosition == null) {
            return ResponseEntity.badRequest().build();
        }
        BoardListDTO reordered = boardListService.reorderList(id, newPosition);
        return ResponseEntity.ok(reordered);
    }
}
