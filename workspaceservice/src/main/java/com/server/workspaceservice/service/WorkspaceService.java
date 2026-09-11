package com.server.workspaceservice.service;

import com.server.workspaceservice.client.AuthClient;
import com.server.workspaceservice.dto.*;
import com.server.workspaceservice.model.Board;
import com.server.workspaceservice.model.Workspace;
import com.server.workspaceservice.model.WorkspaceMembers;
import com.server.workspaceservice.model.WorkspaceRole;
import com.server.workspaceservice.repository.BoardRepo;
import com.server.workspaceservice.repository.WorkSpaceRepo;
import com.server.workspaceservice.repository.WorkspaceMemberRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

//Service for the management of workspaces
@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkSpaceRepo workSpaceRepo;
    private final BoardRepo boardRepo;
    private final WorkspaceMemberRepo workspaceMemberRepo;
    private final AuthClient authClient;


    //Method to fetch workspace usign workspace id
    public WorkspaceDTO getWorkspaceByWorkspaceId(Long workspaceId) {
        return workSpaceRepo.findById(workspaceId).map(w -> WorkspaceDTO.builder().id(w.getId()).name(w.getName()).ownerId(w.getOwnerId()).updatedAt(w.getUpdatedAt()).createdAt(w.getCreatedAt()).build()).orElseThrow(() -> new EntityNotFoundException("Workspace not found with id: " + workspaceId));

    }

    //Method to delete workspace
    public void deleteWorkspace(Long id, Long userId) {
        boolean hasAccess = workSpaceRepo.checkIsOwner(userId, id);
        if (!hasAccess) {
            throw new RuntimeException("You are not the owner of this workspace");
        }
        workSpaceRepo.deleteById(id);
    }

    //Method to create new workspace
    @Transactional
    public WorkspaceDTO createWorkspace(WorkspaceDTO workspaceDTO, Long userId) {
        Workspace workspace = Workspace.builder()
                .name(workspaceDTO.getName())
                .ownerId(workspaceDTO.getOwnerId())
                .build();

        Workspace newWorkspace = workSpaceRepo.save(workspace);

        WorkspaceMembers member = WorkspaceMembers.builder()
                .workspaceId(newWorkspace.getId())
                .role(WorkspaceRole.OWNER)
                .userId(userId)
                .build();
        workspaceMemberRepo.save(member);
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

        return workSpaceRepo.findByIdInAndOwnerIdNot(workspaceIds, userId)
                .stream()
                .map(workspace -> WorkspaceDTO.builder()
                        .id(workspace.getId())
                        .name(workspace.getName())
                        .ownerId(workspace.getOwnerId())
                        .build())
                .toList();
    }

    //Method to fetch members using workspaceId
    public List<WorkspaceMembersDTO> getWorkspaceMembersByWorkspaceId(
            Long workspaceId,
            Long userId
    ) {
        List<WorkspaceMembers> members = workspaceMemberRepo
                .findByWorkspaceId(workspaceId)
                .stream()
                .filter(member -> !member.getUserId().equals(userId))
                .toList();

        if (members.isEmpty()) {
            return List.of();
        }

        List<Long> userIds = members.stream()
                .map(WorkspaceMembers::getUserId)
                .toList();

        List<UserDTO> users = authClient.getUsersByIds(userIds);

        Map<Long, UserDTO> userMap = users.stream()
                .collect(Collectors.toMap(
                        UserDTO::getId,
                        user -> user
                ));

        return members.stream()
                .map(member -> {
                    UserDTO user = userMap.get(member.getUserId());

                    return WorkspaceMembersDTO.builder()
                            .joinedAt(member.getJoinedAt())

                            .userId(member.getUserId())
                            .name(user.getName())
                            .email(user.getEmail())
                            .avatar(user.getAvatar())
                            .role(member.getRole())
                            .build();
                })
                .toList();
    }


    //Method to add member to the workspace
    public UserDTO addMember(AddMemberDTO addMemberDTO, Long userId) {
        boolean hasAccess = workSpaceRepo.checkIsOwner(userId, addMemberDTO.getWorkspaceId());
        if (!hasAccess) {
            throw new RuntimeException("You are not the owner of this workspace");
        }

        UserDTO user = authClient.getUserByEmail(addMemberDTO.getEmail());

        WorkspaceMembers member = WorkspaceMembers.builder()
                .workspaceId(addMemberDTO.getWorkspaceId())
                .role(WorkspaceRole.MEMBER)
                .userId(user.getId())
                .build();

        workspaceMemberRepo.save(member);

        return user;
    }


    //Method to update workspace
    public void updateWorkspace(Long workspaceId, WorkspaceDTO workspaceDTO, Long userId) {
        Workspace workspace = workSpaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        if (!workspace.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not the owner of this workspace");
        }

        workspace.setName(workspaceDTO.getName());

        workSpaceRepo.save(workspace);
    }
}
