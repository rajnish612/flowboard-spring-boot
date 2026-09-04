package com.server.taskservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "workspaceservice")
public interface WorkspaceClient {

    @GetMapping("/board/{boardId}/access")
    boolean hasBoardAccess(
            @PathVariable("boardId") Long boardId,
            @RequestParam("userId") Long userId
    );
}