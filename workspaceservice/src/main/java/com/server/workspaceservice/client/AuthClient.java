package com.server.workspaceservice.client;


import com.server.workspaceservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;


@FeignClient(name = "authservice")
public interface AuthClient {

    @PostMapping("/users")
    List<UserDTO> getUsersByIds(@RequestBody List<Long> userIds);

    @GetMapping("/user/{email}")
    UserDTO getUserByEmail(
            @PathVariable("email") String email
    );
}
