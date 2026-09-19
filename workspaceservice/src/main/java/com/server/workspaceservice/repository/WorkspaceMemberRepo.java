package com.server.workspaceservice.repository;


import com.server.workspaceservice.model.WorkspaceMembers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

//Repository to interact with the workspace members table
@Repository
public interface WorkspaceMemberRepo extends JpaRepository<WorkspaceMembers, Long> {
    List<WorkspaceMembers> findByUserId(Long id);


    //Fetch members using workspace id;
    List<WorkspaceMembers> findByWorkspaceId(Long id);

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
    boolean deleteByWorkspaceId(Long workspaceId);
}
