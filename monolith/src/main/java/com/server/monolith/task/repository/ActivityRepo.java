package com.server.monolith.task.repository;

import com.server.monolith.task.model.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepo extends JpaRepository<Activity, Long> {

    Page<Activity> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId, Pageable pageable);
}
