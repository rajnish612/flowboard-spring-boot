package com.server.monolith.workspace.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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

    @Size(min = 1, max = 100, message = "name must be between 1 and 100 characters")
    private String name;

    @Positive(message = "ownerId must be positive")
    private Long ownerId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
