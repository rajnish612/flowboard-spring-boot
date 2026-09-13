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

@RestController
@RequestMapping("/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    //Endpoint to fetch all activities
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<ActivityDTO>> getWorkspaceActivities(
            @PathVariable Long workspaceId
    ) {

        return ResponseEntity.ok(
                activityService.getActivitiesByWorkspaceId(workspaceId)
        );
    }
}
