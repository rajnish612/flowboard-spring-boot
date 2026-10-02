package com.server.monolith.task.service;

import com.server.monolith.auth.dto.UserDTO;
import com.server.monolith.auth.service.UserService;
import com.server.monolith.task.dto.ActivityDTO;
import com.server.monolith.task.model.Activity;
import com.server.monolith.task.model.ActivityType;
import com.server.monolith.task.repository.ActivityRepo;
import com.server.monolith.workspace.dto.BoardDTO;
import com.server.monolith.workspace.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepo activityRepo;
    private final UserService userService;
    private final BoardService boardService;

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
        log.info("Creating activity: type={}, userId={}, workspaceId={}, boardId={}",
                type, userId, workspaceId, boardId);

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
        Activity savedActivity = activityRepo.save(activity);
        log.info("Activity created successfully: activityId={}, type={}",
                savedActivity.getId(), type);
        return savedActivity;
    }

    // fetch activities using workspaceId
    public Page<ActivityDTO> getActivitiesByWorkspaceId(Long workspaceId, Pageable pageable) {
        log.info("Fetching activity for workspace with id: {}", workspaceId);
        Page<Activity> activities =
                activityRepo.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId, pageable);
        if (activities.isEmpty()) {
            log.info("No activities found for workspaceId={}", workspaceId);
            return Page.empty(pageable);
        }
        List<Long> boardIds = activities.stream().map(Activity::getBoardId).filter(Objects::nonNull).distinct().toList();
        List<Long> userIds = activities.stream().map(Activity::getUserId).filter(Objects::nonNull).distinct().toList();
        List<Long> assignedToIds = activities.stream().map(Activity::getAssignedTo).filter(Objects::nonNull).distinct().toList();
        List<UserDTO> users = userService.getUsersByIds(userIds);
        List<BoardDTO> boards = boardService.getBoardsByIds(boardIds);
        List<UserDTO> assignedToUsers =
                assignedToIds.isEmpty()
                        ? List.of()
                        : userService.getUsersByIds(assignedToIds);

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


        Page<ActivityDTO> result = activities.map(activity ->
                toDTO(
                        activity,
                        usersMapped,
                        assignedToUsersMapped,
                        boardsMapped
                )
        );
        log.info("Fetched {} activities for workspaceId={}",
                result.getNumberOfElements(), workspaceId);
        return result;

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