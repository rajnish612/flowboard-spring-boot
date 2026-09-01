package com.server.workspaceservice.service;

import com.server.workspaceservice.client.AuthClient;
import com.server.workspaceservice.dto.*;
import com.server.workspaceservice.model.Workspace;
import com.server.workspaceservice.model.WorkspaceMembers;
import com.server.workspaceservice.repository.BoardRepo;
import com.server.workspaceservice.repository.WorkSpaceRepo;
import com.server.workspaceservice.repository.WorkspaceMemberRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

//Service for the management of workspaces
@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkSpaceRepo workSpaceRepo;
    private final BoardRepo boardRepo;
    private final WorkspaceMemberRepo workspaceMemberRepo;
    private final AuthClient authClient;

    //Method to create new workspace
    public WorkspaceDTO createWorkspace(WorkspaceDTO workspaceDTO) {
        Workspace workspace = Workspace.builder()
                .name(workspaceDTO.getName())
                .ownerId(workspaceDTO.getOwnerId())
                .build();

        Workspace newWorkspace = workSpaceRepo.save(workspace);
        return WorkspaceDTO.builder()
                .id(newWorkspace.getId())
                .name(newWorkspace.getName())
                .ownerId(newWorkspace.getOwnerId())
                .createdAt(newWorkspace.getCreatedAt())
                .updatedAt(newWorkspace.getUpdatedAt())
                .build();
    }

    //Method to get workspaces by ownerId
    public List<WorkspaceDTO> getWorkspacesByOwnerId(Long ownerId) {
        List<Workspace> workspaces = workSpaceRepo.findByOwnerId(ownerId);
        return workspaces.stream().map(w -> WorkspaceDTO.builder()
                .id(w.getId())
                .name(w.getName())
                .ownerId(w.getOwnerId())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build()).toList();
    }


    //Method to get all the shared workspaces
    public List<WorkspaceDTO> getSharedWorkspaces(Long userId) {

        List<Long> workspaceIds = workspaceMemberRepo.findByUserId(userId)
                .stream()
                .map(WorkspaceMembers::getWorkspaceId)
                .toList();

        if (workspaceIds.isEmpty()) {
            return List.of();
        }

        return workSpaceRepo.findByIdIn(workspaceIds)
                .stream()
                .map(workspace -> WorkspaceDTO.builder()
                        .id(workspace.getId())
                        .name(workspace.getName())
                        .ownerId(workspace.getOwnerId())
                        .build())
                .toList();
    }

    //Method to fetch members using workspaceId
    public List<UserDTO> getWorkspaceMembersByWorkspaceId(Long workspaceId) {
        List<WorkspaceMembers> workspaceMembers = workspaceMemberRepo.findByWorkspaceId(workspaceId);
        List<Long> userIds = workspaceMembers.stream().map(WorkspaceMembers::getUserId).toList();
        if (userIds.isEmpty()) {
            return List.of();
        }
        return authClient.getUsersByIds(userIds);
    }

    //Method to add member to the workspace
    public UserDTO addMember(AddMemberDTO addMemberDTO) {
        UserDTO user = authClient.getUserByEmail(addMemberDTO.getEmail());

        WorkspaceMembers member = WorkspaceMembers.builder()
                .workspaceId(addMemberDTO.getWorkspaceId())
                .userId(user.getId())
                .build();

        workspaceMemberRepo.save(member);

        return user;
    }


}
