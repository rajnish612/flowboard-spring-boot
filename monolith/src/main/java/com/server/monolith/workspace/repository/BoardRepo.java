package com.server.monolith.workspace.repository;

import com.server.monolith.workspace.model.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

//Repository to interact with the workspace members table
@Repository
public interface BoardRepo extends JpaRepository<Board, Long> {
    List<Board> findBoardsByWorkspaceId(Long workspaceId);

    Page<Board> findBoardsByWorkspaceId(Long workspaceId, Pageable pageable);

    // Delete all members of a workspace
    void deleteByWorkspaceId(Long workspaceId);
}
