package com.server.taskservice.component;

import com.server.taskservice.client.WorkspaceClient;
import com.server.taskservice.model.BoardList;
import com.server.taskservice.model.Card;
import com.server.taskservice.repository.BoardListRepo;
import com.server.taskservice.repository.CardRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

//Custom component to check if user is allowed to modify cards and list of the workspace
@Component("taskAuthorization")
@RequiredArgsConstructor
public class TaskAuthorization {

    private final WorkspaceClient workspaceClient;
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
        return workspaceClient.hasBoardAccess(boardId, userId);
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

        return workspaceClient.hasBoardAccess(
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

        return workspaceClient.hasBoardAccess(
                list.getBoardId(),
                userId
        );
    }
}