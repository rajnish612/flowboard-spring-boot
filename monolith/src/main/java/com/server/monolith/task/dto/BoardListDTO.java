package com.server.monolith.task.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Data Transfer Object for BoardList responses and requests
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardListDTO {

    private Long id;

    @Positive(message = "boardId must be positive")
    private Long boardId;
    @Positive(message = "workspaceId must be positive")
    private Long workspaceId;
    @Size(min = 1, max = 100, message = "name must be between 1 and 100 characters")
    private String name;


    @PositiveOrZero(message = "position must not be negative")
    private Integer position;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
