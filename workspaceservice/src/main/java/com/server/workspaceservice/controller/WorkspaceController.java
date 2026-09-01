package com.server.workspaceservice.controller;

import com.server.workspaceservice.dto.AddMemberDTO;
import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.dto.UserDTO;
import com.server.workspaceservice.dto.WorkspaceDTO;
import com.server.workspaceservice.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//Handle request and response for workspaces
@RestController
@RequiredArgsConstructor
@RequestMapping("/")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    //End point to create a workspace
    @PostMapping("create")
    public ResponseEntity<WorkspaceDTO> createWorkspace(@RequestBody WorkspaceDTO workspace) {

        WorkspaceDTO newWorkspace = workspaceService.createWorkspace(workspace);
        return ResponseEntity.ok(newWorkspace);
    }


    //End point to get all workspaces using owner id
    @GetMapping("/")
    public ResponseEntity<List<WorkspaceDTO>> getWorkspacesByOwnerId(@AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");
        if (userId == null) {
            throw new UsernameNotFoundException("Unauthorized");
        }
        List<WorkspaceDTO> workspaces = workspaceService.getWorkspacesByOwnerId(userId);
        return ResponseEntity.ok(workspaces);

    }

    //End point to fetch members using workspace id
    @GetMapping("/member/{workspaceId}")
    public ResponseEntity<List<UserDTO>> getMembersByWorkspaceId(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(workspaceService.getWorkspaceMembersByWorkspaceId(workspaceId));
    }

    //Endpoint to fetch all shared workspaces
    @GetMapping("/shared")
    public ResponseEntity<List<WorkspaceDTO>> getSharedWorkspaces(
            @AuthenticationPrincipal Jwt jwt) {

        Long userId = jwt.getClaim("userId");

        return ResponseEntity.ok(
                workspaceService.getSharedWorkspaces(userId)
        );
    }


    //Endpoint to add member to the workspace
    @PostMapping("/member")
    public ResponseEntity<UserDTO> addMember(@RequestBody AddMemberDTO addMemberDTO) {
        return ResponseEntity.ok(workspaceService.addMember(addMemberDTO));
    }

}
