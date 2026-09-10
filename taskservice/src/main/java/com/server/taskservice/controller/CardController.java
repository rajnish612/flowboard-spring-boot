package com.server.taskservice.controller;

import com.server.taskservice.dto.CardDTO;
import com.server.taskservice.service.CardService;
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

// Handles HTTP requests for cards (Trello tasks)
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/card")
public class CardController {

    private final CardService cardService;
    private final BoardEventPublisher boardEventPublisher;

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
    @PostMapping("/create/{boardId}")
    public ResponseEntity<CardDTO> createCard(@PathVariable Long boardId, @RequestBody CardDTO dto, @AuthenticationPrincipal Jwt jwt) {
        CardDTO created = cardService.createCard(dto);
        Long userId = jwt.getClaim("userId");
        boardEventPublisher.publish(userId, "CARD_CREATED", boardId, created);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /card/{id} — update card fields
    @PreAuthorize(
            "@taskAuthorization.hasCardAccess(#id, authentication)"
    )
    @PutMapping("/{id}/{boardId}")
    public ResponseEntity<CardDTO> updateCard(@PathVariable Long id, @PathVariable Long boardId, @RequestBody CardDTO dto, @AuthenticationPrincipal Jwt jwt) {

        CardDTO updated = cardService.updateCard(id, dto);
        Long userId = jwt.getClaim("userId");
        boardEventPublisher.publish(userId, "CARD_UPDATED", boardId, updated);
        return ResponseEntity.ok(updated);
    }

    // DELETE /card/{id} — delete a card
    @PreAuthorize(
            "@taskAuthorization.hasCardAccess(#id, authentication)"
    )
    @DeleteMapping("/{id}/{boardId}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id, @PathVariable Long boardId, @AuthenticationPrincipal Jwt jwt) {
        cardService.deleteCard(id);
        Long userId = jwt.getClaim("userId");
        boardEventPublisher.publish(userId, "CARD_DELETED", boardId, id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /card/{id}/move — move a card to a different list / position
    // Request body: { "targetListId": 2, "position": 0 }
    @PostMapping("/{id}/move/{boardId}")
    public ResponseEntity<CardDTO> moveCard(
            @PathVariable Long id,
            @PathVariable Long boardId,
            @RequestBody Map<String, Object> body, @AuthenticationPrincipal Jwt jwt) {

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
        Long userId = jwt.getClaim("userId");
        boardEventPublisher.publish(userId, "CARD_MOVED", boardId, moved);
        return ResponseEntity.ok(moved);
    }
}
