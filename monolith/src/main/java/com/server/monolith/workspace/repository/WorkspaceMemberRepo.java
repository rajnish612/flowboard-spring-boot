package com.server.monolith.workspace.repository;


import com.server.monolith.workspace.model.WorkspaceMembers;
import com.server.monolith.workspace.model.WorkspaceRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

//Repository to interact with the workspace members table
@Repository
public interface WorkspaceMemberRepo extends JpaRepository<WorkspaceMembers, Long> {
    Page<WorkspaceMembers> findByUserId(Long id, Pageable pageable);


    //Fetch members using workspace id;
    List<WorkspaceMembers> findByWorkspaceId(Long id);

    Page<WorkspaceMembers> findByWorkspaceId(Long id, Pageable pageable);

    Optional<WorkspaceMembers> findByWorkspaceIdAndUserId(
            Long workspaceId,
            Long userId
    );


    //Check if user is a member of the workspace or not using workspaceId and userId
    boolean existsByWorkspaceIdAndUserId(
            Long workspaceId,
            Long userId
    );

    // Delete all members of a workspace
    void deleteByWorkspaceId(Long workspaceId);


    //find workspace members by userId and role
    Page<WorkspaceMembers> findByUserIdAndRole(Long userId, WorkspaceRole workspaceRole, Pageable pageable);

    //find top 5 workspace members by workspaceId and role and order by joined at
    List<WorkspaceMembers> findTop5ByWorkspaceIdAndUserIdNotOrderByJoinedAtAsc(
            Long workspaceId,
            Long userId
    );

    //count total members by workspaceId and role
    Long countByWorkspaceId(
            Long workspaceId

    );
}
