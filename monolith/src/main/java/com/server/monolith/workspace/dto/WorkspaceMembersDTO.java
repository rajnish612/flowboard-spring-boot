package com.server.monolith.workspace.dto;


import com.server.monolith.workspace.model.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

//DTO object for workspace members
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMembersDTO {
    private Long id;
    private String email;
    private String avatar;
    private String name;

    private Long workspaceId;


    private Long userId;


    private WorkspaceRole role;

    private LocalDateTime joinedAt;
}
