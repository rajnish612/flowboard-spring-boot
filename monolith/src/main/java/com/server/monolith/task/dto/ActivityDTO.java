package com.server.monolith.task.dto;

import com.server.monolith.task.model.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


//DTO for transferring activity data
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDTO {

    private Long id;

    private Long userId;
    private String userName;
    private String userAvatar;

    private String action;
    private String message;
    private Long assignedTo;
    private String assignedToName;
    private String assignedToAvatar;

    private String boardName;

    private LocalDateTime createdAt;

    private ActivityType type;
}