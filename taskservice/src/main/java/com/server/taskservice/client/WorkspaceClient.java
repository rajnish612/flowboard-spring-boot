package com.server.taskservice.client;

import com.server.taskservice.dto.BoardDTO;
import com.server.taskservice.dto.WorkspaceDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "workspaceservice")
public interface WorkspaceClient {

    @GetMapping("/board/{boardId}/access")
    boolean hasBoardAccess(
            @PathVariable("boardId") Long boardId,
            @RequestParam("userId") Long userId
    );

    @PostMapping("/board")
    public List<BoardDTO> getBoardsByBoardsId(@RequestBody List<Long> boardIds);

    @GetMapping("/get/{boardId}")
    public WorkspaceDTO getWorkspaceByBoardId(@PathVariable Long boardId);

    @GetMapping("/{workspaceId}")
    public WorkspaceDTO getWorkspaceByWorkspaceId(@PathVariable Long workspaceId);

}