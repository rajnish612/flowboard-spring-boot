package com.server.notificationservice.client;

import com.server.notificationservice.dto.CardDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "taskservice")
public interface TaskClient {

    // Get card details so we can populate cardTitle.
    @GetMapping("/card/{cardId}")
    CardDTO getCardById(
            @PathVariable Long cardId
    );

}
