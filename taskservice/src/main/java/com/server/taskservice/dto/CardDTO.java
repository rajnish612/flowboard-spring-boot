package com.server.taskservice.dto;

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

    private Long listId;

    private String title;

    private String description;

    private Integer position;

    private Long assignedTo;

    private LocalDateTime dueDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
