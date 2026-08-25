package com.server.workspaceservice.service;

import com.server.workspaceservice.dto.BoardDTO;
import com.server.workspaceservice.dto.WorkspaceDTO;
import com.server.workspaceservice.model.Workspace;
import com.server.workspaceservice.repository.BoardRepo;
import com.server.workspaceservice.repository.WorkSpaceRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

//Service for the management of workspaces
@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkSpaceRepo workSpaceRepo;
    private final BoardRepo boardRepo;

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



}
