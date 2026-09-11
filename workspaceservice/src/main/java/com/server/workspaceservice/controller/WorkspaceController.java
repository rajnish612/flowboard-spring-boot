package com.server.workspaceservice.controller;

import com.server.workspaceservice.dto.*;
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


    //Endpoint to fetch workspace using workspaceId
    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDTO> getWorkspaceByWorkspaceId(@PathVariable Long workspaceId) {


        return ResponseEntity.ok(workspaceService.getWorkspaceByWorkspaceId(workspaceId));
    }

    //Endpoint to delete workspace using workspaceId
    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<String> deleteWorkspace(@PathVariable Long workspaceId, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");
        workspaceService.deleteWorkspace(workspaceId, userId);
        return ResponseEntity.ok("deleted");
    }


    //Endpoint to update workspace using workspace id
    @PutMapping("/{workspaceId}")
    public ResponseEntity<String> updateWorkspace(@PathVariable Long workspaceId, @RequestBody WorkspaceDTO workspaceDTO, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");
        workspaceService.updateWorkspace(workspaceId, workspaceDTO, userId);
        return ResponseEntity.ok("updated");
    }

    //End point to create a workspace
    @PostMapping("create")
    public ResponseEntity<WorkspaceDTO> createWorkspace(@RequestBody WorkspaceDTO workspace, @AuthenticationPrincipal Jwt jwt) {

        Long userId = jwt.getClaim("userId");
        WorkspaceDTO newWorkspace = workspaceService.createWorkspace(workspace, userId);
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
    public ResponseEntity<List<WorkspaceMembersDTO>> getMembersByWorkspaceId(@AuthenticationPrincipal Jwt jwt, @PathVariable Long workspaceId) {
        Long userId = jwt.getClaim("userId");
        return ResponseEntity.ok(workspaceService.getWorkspaceMembersByWorkspaceId(workspaceId, userId));
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
    public ResponseEntity<UserDTO> addMember(@RequestBody AddMemberDTO addMemberDTO, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");
        return ResponseEntity.ok(workspaceService.addMember(addMemberDTO, userId));
    }

}
