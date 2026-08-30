package com.server.taskservice.repository;

import com.server.taskservice.model.BoardList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Repository to interact with the lists table
@Repository
public interface BoardListRepo extends JpaRepository<BoardList, Long> {

    // Fetch all lists for a given board, ordered by position
    List<BoardList> findByBoardIdOrderByPositionAsc(Long boardId);

    // Get the current highest position value for a board's lists
    @Query("SELECT MAX(l.position) FROM BoardList l WHERE l.boardId = :boardId")
    Optional<Integer> findMaxPositionByBoardId(@Param("boardId") Long boardId);

    // Delete all lists belonging to a board (used when a board is deleted)
    void deleteByBoardId(Long boardId);
}
