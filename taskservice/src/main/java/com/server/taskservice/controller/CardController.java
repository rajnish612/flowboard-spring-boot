package com.server.taskservice.controller;

import com.server.taskservice.dto.CardDTO;
import com.server.taskservice.service.CardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Handles HTTP requests for cards (Trello tasks)
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/card")
public class CardController {

    private final CardService cardService;

    // GET /card/{listId} — fetch all cards in a list
    @PreAuthorize(
            "@taskAuthorization.hasListAccess(#listId, authentication)"
    )
    @GetMapping("/{listId}")
    public ResponseEntity<List<CardDTO>> getCardsByListId(@PathVariable Long listId) {
        log.info("Fetching cards for list {}", listId);
        return ResponseEntity.ok(cardService.getCardsByListId(listId));
    }

    // POST /card/create — create a new card
    @PostMapping("/create")
    public ResponseEntity<CardDTO> createCard(@RequestBody CardDTO dto) {
        CardDTO created = cardService.createCard(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /card/{id} — update card fields
    @PreAuthorize(
            "@taskAuthorization.hasCardAccess(#id, authentication)"
    )
    @PutMapping("/{id}")
    public ResponseEntity<CardDTO> updateCard(@PathVariable Long id, @RequestBody CardDTO dto) {
   
        CardDTO updated = cardService.updateCard(id, dto);
        return ResponseEntity.ok(updated);
    }

    // DELETE /card/{id} — delete a card
    @PreAuthorize(
            "@taskAuthorization.hasCardAccess(#id, authentication)"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        cardService.deleteCard(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /card/{id}/move — move a card to a different list / position
    // Request body: { "targetListId": 2, "position": 0 }
    @PostMapping("/{id}/move")
    public ResponseEntity<CardDTO> moveCard(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Long targetListId = body.containsKey("targetListId")
                ? Long.valueOf(body.get("targetListId").toString())
                : null;
        Integer position = body.containsKey("position")
                ? Integer.valueOf(body.get("position").toString())
                : null;

        if (targetListId == null || position == null) {
            return ResponseEntity.badRequest().build();
        }

        CardDTO moved = cardService.moveCard(id, targetListId, position);
        return ResponseEntity.ok(moved);
    }
}
