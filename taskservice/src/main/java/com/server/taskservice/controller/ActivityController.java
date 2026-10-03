package com.server.taskservice.controller;

import com.server.taskservice.dto.ActivityDTO;
import com.server.taskservice.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    //Endpoint to fetch all activities
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<Page<ActivityDTO>> getWorkspaceActivities(
            @PathVariable Long workspaceId,
            @PageableDefault(size = 10) Pageable pageable
    ) {

        return ResponseEntity.ok(
                activityService.getActivitiesByWorkspaceId(workspaceId, pageable)
        );
    }
}
