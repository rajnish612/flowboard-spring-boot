package com.server.taskservice.repository;

import com.server.taskservice.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepo extends JpaRepository<Activity, Long> {

    List<Activity> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);
}
