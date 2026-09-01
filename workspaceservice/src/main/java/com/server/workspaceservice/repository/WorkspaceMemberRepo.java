package com.server.workspaceservice.repository;


import com.server.workspaceservice.model.WorkspaceMembers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

//Repository to interact with the workspace members table
@Repository
public interface WorkspaceMemberRepo extends JpaRepository<WorkspaceMembers, Long> {
    List<WorkspaceMembers> findByUserId(Long id);
}
