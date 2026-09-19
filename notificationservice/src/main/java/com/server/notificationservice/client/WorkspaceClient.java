package com.server.notificationservice.client;

import com.server.notificationservice.dto.BoardDTO;
import com.server.notificationservice.dto.WorkspaceDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "workspaceservice")
public interface WorkspaceClient {
    // Get workspace details so we can populate workspaceName.
    @GetMapping("/{workspaceId}")
    WorkspaceDTO getWorkspaceByWorkspaceId(
            @PathVariable Long workspaceId
    );

    // Get multiple boards in one request.
    // This is better than making one request for every notification.
    @PostMapping("/board")
    List<BoardDTO> getBoardsByBoardsId(
            @RequestBody List<Long> boardIds
    );

    // Get all member user IDs belonging to a workspace.
    @GetMapping("/member/{workspaceId}/ids")
    List<Long> getWorkspaceMemberIds(
            @PathVariable Long workspaceId);

    @PostMapping("/workspaces")
    List<WorkspaceDTO> getWorkspacesByWorkspaceId(@RequestBody List<Long> workspaceIds);

}
