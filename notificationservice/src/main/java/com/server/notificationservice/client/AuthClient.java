package com.server.notificationservice.client;

import com.server.notificationservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "authservice")
public interface AuthClient {

    // Get the user who performed the action.
    // Used to populate actorName and actorAvatar.
    @GetMapping("/profile/{id}")
    UserDTO getUser(
            @PathVariable Long id
    );
}
