package com.server.workspaceservice.repository;

import com.server.workspaceservice.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

//Repository to interact with the workspace table
@Repository
public interface WorkSpaceRepo extends JpaRepository<Workspace, Long> {

    List<Workspace> findByOwnerId(Long ownerId);
}
