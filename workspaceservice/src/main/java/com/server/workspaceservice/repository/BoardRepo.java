package com.server.workspaceservice.repository;

import com.server.workspaceservice.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

//Repository to interact with the workspace members table
@Repository
public interface BoardRepo extends JpaRepository<Board, Long> {
    List<Board> findBoardsByWorkspaceId(Long workspaceId);
}
