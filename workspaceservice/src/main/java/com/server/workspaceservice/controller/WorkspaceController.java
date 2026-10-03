package com.server.workspaceservice.controller;

import com.server.workspaceservice.dto.*;
import com.server.workspaceservice.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;

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

    //Endpoint to fetch workspaces using workspaceIds
    @PostMapping("/workspaces")
    public ResponseEntity<List<WorkspaceDTO>> getWorkspacesByWorkspaceId(@RequestBody List<Long> workspaceIds) {


        return ResponseEntity.ok(workspaceService.getWorkspacesByWorkspaceId(workspaceIds));
    }

    //Endpoint to fetch workspace using boardId
    @GetMapping("/get/{boardId}")
    public ResponseEntity<WorkspaceDTO> getWorkspaceByBoardId(@PathVariable Long boardId) {


        return ResponseEntity.ok(workspaceService.getWorkspaceByBoardId(boardId));
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
    public ResponseEntity<String> updateWorkspace(@PathVariable Long workspaceId, @Valid @RequestBody WorkspaceDTO workspaceDTO, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");
        workspaceService.updateWorkspace(workspaceId, workspaceDTO, userId);
        return ResponseEntity.ok("updated");
    }

    //End point to create a workspace
    @PostMapping("create")
    public ResponseEntity<WorkspaceDTO> createWorkspace(@Valid @RequestBody WorkspaceDTO workspace, @AuthenticationPrincipal Jwt jwt) {

        Long userId = jwt.getClaim("userId");
        WorkspaceDTO newWorkspace = workspaceService.createWorkspace(workspace, userId);
        return ResponseEntity.ok(newWorkspace);
    }


    //End point to get all workspaces using owner id
    @GetMapping("/")
    public ResponseEntity<Page<WorkspaceDTO>> getWorkspacesByOwnerId(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = jwt.getClaim("userId");
        if (userId == null) {
            throw new UsernameNotFoundException("Unauthorized");
        }
        return ResponseEntity.ok(workspaceService.getWorkspacesByOwnerId(userId, pageable));

    }

    //End point to fetch members using workspace id
    @GetMapping("/member/{workspaceId}")
    public ResponseEntity<Page<WorkspaceMembersDTO>> getMembersByWorkspaceId(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Long workspaceId,
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = jwt.getClaim("userId");
        return ResponseEntity.ok(workspaceService.getWorkspaceMembersByWorkspaceId(workspaceId, userId, pageable));
    }


    //Get workspace members ids using workspace id
    @GetMapping("/member/{workspaceId}/ids")
    public ResponseEntity<List<Long>> getMemberIds(
            @PathVariable Long workspaceId
    ) {
        return ResponseEntity.ok(
                workspaceService.getWorkspaceMemberIds(workspaceId)
        );
    }

    //Endpoint to fetch all shared workspaces
    @GetMapping("/shared")
    public ResponseEntity<Page<WorkspaceDTO>> getSharedWorkspaces(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10) Pageable pageable) {

        Long userId = jwt.getClaim("userId");

        return ResponseEntity.ok(
                workspaceService.getSharedWorkspaces(userId, pageable)
        );
    }


    //Endpoint to add member to the workspace
    @PostMapping("/member")
    public ResponseEntity<UserDTO> addMember(@Valid @RequestBody AddMemberDTO addMemberDTO, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");
        return ResponseEntity.ok(workspaceService.addMember(addMemberDTO, userId));
    }

    // Endpoint to remove a member from a workspace
    @DeleteMapping("/member/{workspaceId}/{memberUserId}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long workspaceId,
            @PathVariable Long memberUserId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = jwt.getClaim("userId");
        workspaceService.removeMember(workspaceId, memberUserId, userId);
        return ResponseEntity.ok("Member removed");
    }

    @GetMapping("/search")
    public ResponseEntity<Page<WorkspaceDTO>> searchWorkspace(@RequestParam String workspaceName,
            @RequestParam boolean shared, @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = jwt.getClaim("userId");
        return ResponseEntity.ok(workspaceService.findWorkspaceByNameStartingWith(workspaceName, shared, userId, pageable));
    }


    //Endpoint to fetch top 5 workspace members and total members count
    @GetMapping("/member/{workspaceId}/summary")
    public ResponseEntity<WorkspaceMembersSummaryDTO> getWorkspaceMembersSummary(
            @PathVariable Long workspaceId, @AuthenticationPrincipal Jwt jwt) {
        Long userId = jwt.getClaim("userId");
        return ResponseEntity.ok(
                workspaceService.getTop5WorkspaceMembersAndTotalMembersCount(workspaceId, userId)
        );
    }

}
