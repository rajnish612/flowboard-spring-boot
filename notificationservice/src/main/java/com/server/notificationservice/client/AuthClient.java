package com.server.notificationservice.client;

import com.server.notificationservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "authservice")
public interface AuthClient {

    // Get the user who performed the action.
    // Used to populate actorName and actorAvatar.
    @GetMapping("/profile/{id}")
    UserDTO getUser(
            @PathVariable Long id
    );

    //Get multiple users using userIds
    @PostMapping("/users")
    List<UserDTO> getUsersByUserId(@RequestBody List<Long> userIds);

}
