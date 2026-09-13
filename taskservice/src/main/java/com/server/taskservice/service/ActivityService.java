package com.server.taskservice.service;

import com.server.taskservice.client.AuthClient;
import com.server.taskservice.client.WorkspaceClient;
import com.server.taskservice.dto.ActivityDTO;
import com.server.taskservice.dto.UserDTO;
import com.server.taskservice.dto.WorkspaceDTO;
import com.server.taskservice.model.Activity;
import com.server.taskservice.model.ActivityType;
import com.server.taskservice.repository.ActivityRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepo activityRepo;
    private final AuthClient authClient;
    private final WorkspaceClient workspaceClient;

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

    // fetch activities using workspaceId
    public List<ActivityDTO> getActivitiesByWorkspaceId(Long workspaceId) {

        List<Activity> activities =
                activityRepo.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);

        return activities.stream()
                .map(this::toDTO)
                .toList();
    }

    //for the purpose of converting Activity object into ActivityDTO object
    private ActivityDTO toDTO(Activity activity) {

        UserDTO actor =
                authClient.getProfile(activity.getUserId());

        UserDTO assignedUser = null;

        if (activity.getAssignedTo() != null) {
            assignedUser =
                    authClient.getProfile(activity.getAssignedTo());
        }

        WorkspaceDTO workspace =
                workspaceClient.getWorkspaceByWorkspaceId(
                        activity.getWorkspaceId()
                );

        return ActivityDTO.builder()
                .id(activity.getId())
                .userId(activity.getUserId())
                .userName(actor.getName())
                .userAvatar(actor.getAvatar())
                .assignedTo(activity.getAssignedTo())
                .action(getAction(activity.getType()))
                .message(activity.getMessage())

                .assignedToName(
                        assignedUser != null
                                ? assignedUser.getName()
                                : null
                )
                .assignedToAvatar(
                        assignedUser != null
                                ? assignedUser.getAvatar()
                                : null
                )

                .boardName(getBoardName(workspace, activity.getBoardId()))
                .createdAt(activity.getCreatedAt())
                .type(activity.getType())
                .build();
    }

    private String getAction(ActivityType type) {

        return switch (type) {
            case CARD_CREATED, LIST_CREATED -> "CREATED";
            case CARD_UPDATED, LIST_UPDATED -> "UPDATED";
            case CARD_MOVED, LIST_MOVED -> "MOVED";
            case CARD_ASSIGNED -> "ASSIGNED";
            case CARD_UNASSIGNED -> "UNASSIGNED";
            case CARD_DELETED, LIST_DELETED -> "DELETED";
        };
    }


    private String getBoardName(
            WorkspaceDTO workspace,
            Long boardId
    ) {
        // Replace this once Workspace Service exposes board lookup.
        return "Board " + boardId;
    }


}