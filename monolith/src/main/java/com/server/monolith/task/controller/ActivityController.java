package com.server.monolith.task.controller;

import com.server.monolith.task.dto.ActivityDTO;
import com.server.monolith.task.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/task/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    //Endpoint to fetch all activities
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<Page<ActivityDTO>> getWorkspaceActivities(
            @PathVariable Long workspaceId,
            @PageableDefault(10) Pageable pageable
    ) {

        return ResponseEntity.ok(
                activityService.getActivitiesByWorkspaceId(workspaceId,pageable)
        );
    }
}
