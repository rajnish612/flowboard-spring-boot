package com.server.taskservice.dto;

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

    private Long boardId;

    private String name;

    private Integer position;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
