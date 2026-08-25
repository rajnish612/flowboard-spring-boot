package com.server.workspaceservice.dto;


import com.server.workspaceservice.model.WorkspaceRole;
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

    private Long workspaceId;


    private Long userId;


    private WorkspaceRole role;


    private LocalDateTime joinedAt;
}
