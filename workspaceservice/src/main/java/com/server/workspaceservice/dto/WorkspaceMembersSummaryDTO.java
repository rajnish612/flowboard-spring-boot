package com.server.workspaceservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceMembersSummaryDTO {

    private List<WorkspaceMembersDTO> members;

    private long totalMembers;
}