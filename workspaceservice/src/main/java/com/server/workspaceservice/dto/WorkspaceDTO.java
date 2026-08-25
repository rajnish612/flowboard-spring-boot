package com.server.workspaceservice.dto;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

//DTO object for workspaces
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceDTO {
    private Long id;

    private String name;

    private Long ownerId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
