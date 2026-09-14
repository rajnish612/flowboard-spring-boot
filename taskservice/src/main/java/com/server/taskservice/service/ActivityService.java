package com.server.taskservice.service;

import com.server.taskservice.client.AuthClient;
import com.server.taskservice.client.WorkspaceClient;
import com.server.taskservice.dto.ActivityDTO;
import com.server.taskservice.dto.BoardDTO;
import com.server.taskservice.dto.UserDTO;
import com.server.taskservice.dto.WorkspaceDTO;
import com.server.taskservice.model.Activity;
import com.server.taskservice.model.ActivityType;
import com.server.taskservice.repository.ActivityRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

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
        if (activities.isEmpty()) {
            return List.of();
        }
        List<Long> boardIds = activities.stream().map(Activity::getBoardId).filter(Objects::nonNull).distinct().toList();
        List<Long> userIds = activities.stream().map(Activity::getUserId).filter(Objects::nonNull).distinct().toList();
        List<Long> assignedToIds = activities.stream().map(Activity::getAssignedTo).filter(Objects::nonNull).distinct().toList();
        List<UserDTO> users = authClient.getUsersByIds(userIds);
        List<BoardDTO> boards = workspaceClient.getBoardsByBoardsId(boardIds);
        List<UserDTO> assignedToUsers =
                assignedToIds.isEmpty()
                        ? List.of()
                        : authClient.getUsersByIds(assignedToIds);

        Map<Long, BoardDTO> boardsMapped = boards.stream().collect(Collectors.toMap(BoardDTO::getId, Function.identity()));
        Map<Long, UserDTO> usersMapped = users.stream()
                .collect(Collectors.toMap(
                        UserDTO::getId,
                        Function.identity()
                ));
        Map<Long, UserDTO> assignedToUsersMapped =
                assignedToUsers.stream()
                        .collect(Collectors.toMap(
                                UserDTO::getId,
                                Function.identity()
                        ));

        return activities.stream()
                .map(activity -> toDTO(
                        activity,
                        usersMapped,
                        assignedToUsersMapped,
                        boardsMapped
                ))
                .toList();
    }

    //for the purpose of converting Activity object into ActivityDTO object
    private ActivityDTO toDTO(Activity activity, Map<Long, UserDTO> usersMapped,
                              Map<Long, UserDTO> assignedToUsersMapped, Map<Long, BoardDTO> boardsMapped

    ) {

        UserDTO actor =
                usersMapped.get(activity.getUserId());

        UserDTO assignedUser =
                assignedToUsersMapped.get(activity.getAssignedTo());

        String boardName = boardsMapped.get(activity.getBoardId()).getName();
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

                .boardName(boardName)
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


//    private String getBoardName(
//            WorkspaceDTO workspace,
//            Long boardId
//    ) {
//        // Replace this once Workspace Service exposes board lookup.
//        return "Board " + boardId;
//    }


}