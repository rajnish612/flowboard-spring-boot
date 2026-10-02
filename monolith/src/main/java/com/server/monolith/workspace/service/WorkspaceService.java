package com.server.monolith.workspace.service;

import com.server.monolith.auth.dto.UserDTO;
import com.server.monolith.auth.service.UserService;
import com.server.monolith.workspace.dto.*;
import com.server.monolith.exception.BusinessRuleException;
import com.server.monolith.workspace.model.Board;
import com.server.monolith.workspace.model.Workspace;
import com.server.monolith.workspace.model.WorkspaceMembers;
import com.server.monolith.workspace.model.WorkspaceRole;
import com.server.monolith.workspace.repository.BoardRepo;
import com.server.monolith.workspace.repository.WorkSpaceRepo;
import com.server.monolith.workspace.repository.WorkspaceMemberRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

//Service for the management of workspaces
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceService {

        private final WorkSpaceRepo workSpaceRepo;
        private final BoardRepo boardRepo;
        private final WorkspaceMemberRepo workspaceMemberRepo;
        private final UserService userService;

        // Method to fetch workspace usign workspace id
        public WorkspaceDTO getWorkspaceByWorkspaceId(Long workspaceId) {
                log.info("Fetching workspace: workspaceId={}", workspaceId);
                WorkspaceDTO workspaceDTO = workSpaceRepo.findById(workspaceId)
                                .map(w -> WorkspaceDTO.builder().id(w.getId()).name(w.getName()).ownerId(w.getOwnerId())
                                                .updatedAt(w.getUpdatedAt()).createdAt(w.getCreatedAt()).build())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Workspace not found with id: " + workspaceId));
                log.info("Workspace fetched successfully: workspaceId={}", workspaceId);
                return workspaceDTO;
        }

        // Method to get workspace using board id
        public WorkspaceDTO getWorkspaceByBoardId(Long boardId) {
                log.info("Fetching workspace for boardId={}", boardId);

                Board board = boardRepo.findById(boardId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Board not found: " + boardId));

                WorkspaceDTO workspace = workSpaceRepo.findById(board.getWorkspaceId())
                                .map(w -> WorkspaceDTO.builder().name(w.getName()).id(w.getId()).ownerId(w.getOwnerId())
                                                .build())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Board not found: " + boardId));
                log.info("Workspace fetched successfully: workspaceId={}, boardId={}",
                                workspace.getId(), boardId);
                return workspace;

        }

        // Method to delete workspace
        @Transactional
        public void deleteWorkspace(Long id, Long userId) {
                log.info("Deleting workspace: workspaceId={}, userId={}", id, userId);
                boolean hasAccess = workSpaceRepo.checkIsOwner(userId, id);
                if (!hasAccess) {
                        log.warn("Unauthorized workspace deletion attempt: workspaceId={}, userId={}",
                                        id, userId);

                        throw new AccessDeniedException("You are not the owner of this workspace");
                }
                boardRepo.deleteByWorkspaceId(id);
                workspaceMemberRepo.deleteByWorkspaceId(id);
                workSpaceRepo.deleteById(id);
                log.info("Workspace deleted successfully: workspaceId={}, userId={}",
                                id, userId);
        }

        // Method to create new workspace
        @Transactional
        public WorkspaceDTO createWorkspace(WorkspaceDTO workspaceDTO, Long userId) {
                log.info("Creating workspace: userId={}", userId);

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
                log.info("Workspace created successfully: workspaceId={}, userId={}",
                                newWorkspace.getId(), userId);
                return WorkspaceDTO.builder()
                                .id(newWorkspace.getId())
                                .name(newWorkspace.getName())
                                .ownerId(newWorkspace.getOwnerId())
                                .createdAt(newWorkspace.getCreatedAt())
                                .updatedAt(newWorkspace.getUpdatedAt())
                                .build();
        }

        // Method to get workspaces by ownerId
        public Page<WorkspaceDTO> getWorkspacesByOwnerId(Long ownerId, Pageable pageable) {
                log.info("Fetching workspaces for ownerId={}", ownerId);
                Page<Workspace> workspaces = workSpaceRepo.findByOwnerId(ownerId, pageable);

                Page<WorkspaceDTO> result = workspaces.map(w -> WorkspaceDTO.builder()
                                .id(w.getId())
                                .name(w.getName())
                                .ownerId(w.getOwnerId())
                                .createdAt(w.getCreatedAt())
                                .updatedAt(w.getUpdatedAt())
                                .build());
                log.info("Fetched {} workspaces for ownerId={}",
                                result.getNumberOfElements(), ownerId);
                return result;
        }

        // Method to get all the shared workspaces
        public Page<WorkspaceDTO> getSharedWorkspaces(Long userId, Pageable pageable) {
                log.info("Fetching shared workspaces for userId={}", userId);
                Page<WorkspaceMembers> members = workspaceMemberRepo.findByUserId(userId, pageable);

                List<Long> workspaceIds = members.getContent()
                                .stream()
                                .map(WorkspaceMembers::getWorkspaceId)
                                .toList();
                if (workspaceIds.isEmpty()) {
                        return Page.empty(pageable);
                }
                List<WorkspaceDTO> result = workSpaceRepo.findByIdInAndOwnerIdNot(workspaceIds, userId)
                                .stream()
                                .map(workspace -> WorkspaceDTO.builder()
                                                .id(workspace.getId())
                                                .name(workspace.getName())
                                                .ownerId(workspace.getOwnerId())
                                                .build())
                                .toList();

                log.info("Fetched {} shared workspaces for userId={}",
                                result.size(), userId);

                return new PageImpl<>(
                                result,
                                pageable,
                                members.getTotalElements());
        }

        // Method to fetch members using workspaceId
        public Page<WorkspaceMembersDTO> getWorkspaceMembersByWorkspaceId(
                        Long workspaceId,
                        Long userId,
                        Pageable pageable) {
                log.info("Fetching workspace members: workspaceId={}, userId={}",
                                workspaceId, userId);
                Page<WorkspaceMembers> membersPage = workspaceMemberRepo.findByWorkspaceId(workspaceId, pageable);
                List<WorkspaceMembers> members = membersPage.getContent();

                if (members.isEmpty()) {
                        log.debug("No members found for workspaceId={}", workspaceId);
                        return new PageImpl<>(List.of(), pageable, membersPage.getTotalElements());
                }

                List<Long> userIds = members.stream()
                                .map(WorkspaceMembers::getUserId)
                                .toList();

                List<UserDTO> users = userService.getUsersByIds(userIds);

                Map<Long, UserDTO> userMap = users.stream()
                                .collect(Collectors.toMap(
                                                UserDTO::getId,
                                                user -> user));

                Page<WorkspaceMembersDTO> result = membersPage.map(member -> {
                        UserDTO user = userMap.get(member.getUserId());

                        return WorkspaceMembersDTO.builder()
                                        .joinedAt(member.getJoinedAt())
                                        .userId(member.getUserId())
                                        .name(user.getName())
                                        .email(user.getEmail())
                                        .avatar(user.getAvatar())
                                        .role(member.getRole())
                                        .build();
                });

                log.info("Fetched {} workspace members: workspaceId={}, userId={}",
                                result.getNumberOfElements(), workspaceId, userId);

                return result;
        }

        // Method to add member to the workspace
        public UserDTO addMember(AddMemberDTO addMemberDTO, Long userId) {
                log.info("Adding member to workspace: workspaceId={}, userId={}",
                                addMemberDTO.getWorkspaceId(), userId);
                boolean hasAccess = workSpaceRepo.checkIsOwner(userId, addMemberDTO.getWorkspaceId());
                if (!hasAccess) {
                        log.warn("Unauthorized member addition attempt: workspaceId={}, userId={}",
                                        addMemberDTO.getWorkspaceId(), userId);
                        throw new AccessDeniedException("You are not the owner of this workspace");
                }

                UserDTO user = userService.getUserByEmail(addMemberDTO.getEmail());

                WorkspaceMembers member = WorkspaceMembers.builder()
                                .workspaceId(addMemberDTO.getWorkspaceId())
                                .role(WorkspaceRole.MEMBER)
                                .userId(user.getId())
                                .build();

                workspaceMemberRepo.save(member);
                log.info("Member added successfully: workspaceId={}, memberUserId={}, addedByUserId={}",
                                addMemberDTO.getWorkspaceId(),
                                user.getId(),
                                userId);
                return user;
        }

        // Remove a member from a workspace. Only the workspace owner can do this.
        public void removeMember(Long workspaceId, Long memberUserId, Long userId) {
                log.info("Removing workspace member: workspaceId={}, memberUserId={}, userId={}",
                                workspaceId, memberUserId, userId);
                Workspace workspace = workSpaceRepo.findById(workspaceId)
                                .orElseThrow(() -> new EntityNotFoundException("Workspace not found: " + workspaceId));

                if (!workspace.getOwnerId().equals(userId)) {
                        log.warn("Unauthorized member removal attempt: workspaceId={}, memberUserId={}, userId={}",
                                        workspaceId, memberUserId, userId);

                        throw new AccessDeniedException("You are not the owner of this workspace");
                }

                if (workspace.getOwnerId().equals(memberUserId)) {
                        log.warn("Workspace owner removal attempt: workspaceId={}, userId={}",
                                        workspaceId, userId);

                        throw new BusinessRuleException("The workspace owner cannot be removed");
                }

                WorkspaceMembers member = workspaceMemberRepo
                                .findByWorkspaceIdAndUserId(workspaceId, memberUserId)
                                .orElseThrow(() -> new EntityNotFoundException("Member not found in this workspace"));

                workspaceMemberRepo.delete(member);
                log.info("Workspace member removed successfully: workspaceId={}, memberUserId={}, userId={}",
                                workspaceId, memberUserId, userId);
        }

        // Method to update workspace
        public void updateWorkspace(Long workspaceId, WorkspaceDTO workspaceDTO, Long userId) {

                log.info("Updating workspace: workspaceId={}, userId={}",
                                workspaceId, userId);

                Workspace workspace = workSpaceRepo.findById(workspaceId)
                                .orElseThrow(() -> new EntityNotFoundException("Workspace not found: " + workspaceId));

                if (!workspace.getOwnerId().equals(userId)) {
                        log.warn("Unauthorized workspace update attempt: workspaceId={}, userId={}",
                                        workspaceId, userId);

                        throw new AccessDeniedException("You are not the owner of this workspace");
                }

                workspace.setName(workspaceDTO.getName());

                workSpaceRepo.save(workspace);

                log.info("Workspace updated successfully: workspaceId={}, userId={}",
                                workspaceId, userId);
        }

        public List<Long> getWorkspaceMemberIds(Long workspaceId) {
                log.info("Fetching member IDs for workspaceId={}", workspaceId);

                return workspaceMemberRepo.findByWorkspaceId(workspaceId).stream().map(m -> m.getUserId()).toList();
        }

        public List<WorkspaceDTO> getWorkspacesByWorkspaceId(List<Long> workspaceIds) {

                log.info("Fetching workspaces for {} workspace IDs", workspaceIds.size());
                return workSpaceRepo.findByIdIn(workspaceIds).stream().map(w -> WorkspaceDTO.builder().name(w.getName())
                                .id(w.getId()).ownerId(w.getOwnerId()).build()).toList();
        }

        // Method to find both users workspaces as shared workspaces using workspace
        // name and userId
        public Page<WorkspaceDTO> findWorkspaceByNameStartingWith(String workspaceName, Boolean shared, Long userId,
                        Pageable pageable) {
                log.info(
                                "Searching workspaces: userId={}, workspaceName={}, shared={}",
                                userId,
                                workspaceName,
                                shared);
                Page<Workspace> workspaces;
                if (!shared) {
                        workspaces = workSpaceRepo.findByNameStartingWithIgnoreCaseAndOwnerId(workspaceName, userId,
                                        pageable);
                } else {
                        Page<WorkspaceMembers> members = workspaceMemberRepo.findByUserIdAndRole(
                                        userId,
                                        WorkspaceRole.MEMBER,
                                        pageable);

                        List<Long> workspaceIds = members.getContent()
                                        .stream()
                                        .map(WorkspaceMembers::getWorkspaceId)
                                        .toList();

                        if (workspaceIds.isEmpty()) {
                                return Page.empty(pageable);
                        }
                        List<Workspace> sharedWorkspaces = workSpaceRepo.findByIdInAndNameStartingWithIgnoreCase(
                                        workspaceIds,
                                        workspaceName);
                        workspaces = new PageImpl<>(
                                        sharedWorkspaces,
                                        pageable,
                                        members.getTotalElements());

                }
                return workspaces.map(w -> WorkspaceDTO.builder()
                                .id(w.getId())
                                .name(w.getName())
                                .ownerId(w.getOwnerId())
                                .updatedAt(w.getUpdatedAt())
                                .createdAt(w.getCreatedAt())
                                .build());
        }

        // method to fetch top 5 workspace members and total members count
        public WorkspaceMembersSummaryDTO getTop5WorkspaceMembersAndTotalMembersCount(Long workspaceId, Long userId) {

                // Fetch maximum 5 members
                List<WorkspaceMembers> members = workspaceMemberRepo
                                .findTop5ByWorkspaceIdAndUserIdNotOrderByJoinedAtAsc(
                                                workspaceId,
                                                userId);

                // Fetch total member count
                long totalMembers = workspaceMemberRepo.countByWorkspaceId(
                                workspaceId

                );

                // Convert entities to DTOs
                List<Long> memberIds = members.stream()
                                .map(WorkspaceMembers::getUserId)
                                .toList();
                List<WorkspaceMembersDTO> memberDTOs = userService
                                .getUsersByIds(memberIds).stream().map(m -> WorkspaceMembersDTO.builder().id(m.getId())
                                                .name(m.getName()).avatar(m.getAvatar()).email(m.getEmail()).build())
                                .toList();
                return WorkspaceMembersSummaryDTO.builder()
                                .members(memberDTOs)
                                .totalMembers(totalMembers)
                                .build();
        }
}
