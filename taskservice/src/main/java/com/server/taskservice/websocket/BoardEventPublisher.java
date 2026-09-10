package com.server.taskservice.websocket;

import com.server.taskservice.dto.BoardEventSocketDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BoardEventPublisher {
    private final SimpMessagingTemplate messagingTemplate;

    public <T> void publish(
            Long userId,
            String type,
            Long boardId,
            T data
    ) {
        BoardEventSocketDTO<T> event = BoardEventSocketDTO.<T>builder()
                .type(type)
                .userId(userId)
                .boardId(boardId)
                .data(data)
                .build();

        messagingTemplate.convertAndSend(
                "/topic/board/" + boardId,
                event
        );
    }
}
