package com.server.taskservice.service;

import com.server.taskservice.model.Activity;
import com.server.taskservice.model.ActivityType;
import com.server.taskservice.repository.ActivityRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepo activityRepo;

    public Activity createActivity(
            Long userId,
            Long workspaceId,
            Long boardId,
            Long listId,
            Long cardId,
            ActivityType type,
            String message,
            Long assignedTo
    ) {

        Activity activity = Activity.builder()
                .userId(userId)
                .workspaceId(workspaceId)
                .boardId(boardId)
                .listId(listId)
                .cardId(cardId)
                .type(type)
                .message(message)
                .assignedTo(assignedTo)
                .build();

        return activityRepo.save(activity);
    }
}