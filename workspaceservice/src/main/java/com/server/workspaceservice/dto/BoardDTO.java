package com.server.workspaceservice.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

//DTO object for boards
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardDTO {

    private Long id;

    @Positive(message = "workspaceId must be positive")
    private Long workspaceId;


    @Size(min = 1, max = 100, message = "name must be between 1 and 100 characters")
    private String name;

    @Size(max = 2000, message = "description must not exceed 2000 characters")
    private String description;

    @Size(max = 500, message = "backgroundImage must not exceed 500 characters")
    private String backgroundImage;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

