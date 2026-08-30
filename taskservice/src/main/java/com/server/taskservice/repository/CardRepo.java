package com.server.taskservice.repository;

import com.server.taskservice.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// Repository to interact with the cards table
@Repository
public interface CardRepo extends JpaRepository<Card, Long> {

    // Fetch all cards for a given list, ordered by position
    List<Card> findByListIdOrderByPositionAsc(Long listId);

    // Get the current highest position value for a list's cards
    @Query("SELECT MAX(c.position) FROM Card c WHERE c.listId = :listId")
    Optional<Integer> findMaxPositionByListId(@Param("listId") Long listId);

    // Delete all cards belonging to a list (used when a list is deleted)
    void deleteByListId(Long listId);
}
