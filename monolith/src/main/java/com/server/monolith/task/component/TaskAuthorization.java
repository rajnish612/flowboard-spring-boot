package com.server.monolith.task.component;

import com.server.monolith.task.model.BoardList;
import com.server.monolith.task.model.Card;
import com.server.monolith.task.repository.BoardListRepo;
import com.server.monolith.task.repository.CardRepo;
import com.server.monolith.workspace.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

//Custom component to check if user is allowed to modify cards and list of the workspace
@Component("taskAuthorization")
@RequiredArgsConstructor
public class TaskAuthorization {

    private final BoardService boardService;
    private final BoardListRepo boardListRepository;
    private final CardRepo cardRepository;


    //Method to check if user has access to a specific board or not
    public boolean hasBoardAccess(
            Long boardId,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        assert jwt != null;
        Long userId = jwt.getClaim("userId");

        //Call workspace service to check if user belongs to the workspace or not
        return boardService.hasUserAccessToBoard(boardId, userId);
    }

    //Method to check if user has access to a list inside a board
    public boolean hasListAccess(
            Long listId,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        assert jwt != null;
        Long userId = jwt.getClaim("userId");

        BoardList list = boardListRepository.findById(listId)
                .orElse(null);

        if (list == null) {
            return false;
        }

        return boardService.hasUserAccessToBoard(
                list.getBoardId(),
                userId
        );
    }

    //Method to check if user has access to a card inside a list
    public boolean hasCardAccess(
            Long cardId,
            Authentication authentication
    ) {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        assert jwt != null;
        Long userId = jwt.getClaim("userId");

        Card card = cardRepository.findById(cardId)
                .orElse(null);

        if (card == null) {
            return false;
        }

        BoardList list = boardListRepository.findById(card.getListId())
                .orElse(null);

        if (list == null) {
            return false;
        }

        return boardService.hasUserAccessToBoard(
                list.getBoardId(),
                userId
        );
    }
}