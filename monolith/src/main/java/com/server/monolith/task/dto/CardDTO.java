package com.server.monolith.task.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Data Transfer Object for Card responses and requests
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CardDTO {

    private Long id;

    @Positive(message = "listId must be positive")
    private Long listId;

    @Size(min = 1, max = 200, message = "title must be between 1 and 200 characters")
    private String title;

    @Size(max = 5000, message = "description must not exceed 5000 characters")
    private String description;

    @PositiveOrZero(message = "position must not be negative")
    private Integer position;

    @Positive(message = "assignedTo must be positive")
    private Long assignedTo;
    private String assignedToEmail;
    private String assignedToName;
    private String assignedToAvatar;
    private LocalDateTime dueDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
