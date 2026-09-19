package com.server.notificationservice.client;

import com.server.notificationservice.dto.CardDTO;
import com.server.notificationservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "taskservice")
public interface TaskClient {

    // Get card details so we can populate cardTitle.
    @GetMapping("/card/{cardId}")
    CardDTO getCardById(
            @PathVariable Long cardId
    );


    @PostMapping("/cards")
    List<CardDTO> getCardsByCardsId(@RequestBody List<Long> cardIds);
}
