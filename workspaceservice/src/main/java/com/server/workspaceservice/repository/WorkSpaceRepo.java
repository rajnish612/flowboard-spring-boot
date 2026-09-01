package com.server.workspaceservice.repository;

import com.server.workspaceservice.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

//Repository to interact with the workspace table
@Repository
public interface WorkSpaceRepo extends JpaRepository<Workspace, Long> {
    //Find workspaces using list of workspace id
    List<Workspace> findByIdIn(List<Long> ids);
    //Find workspace using ownerId
    List<Workspace> findByOwnerId(Long ownerId);

    //Check if the user is owner of the workspace or not
    @Query("""
            SELECT CASE WHEN COUNT(w) > 0 THEN true ELSE false END
            FROM Workspace w
            WHERE w.ownerId = :ownerId
              AND w.id = :workspaceId
            """)
    Boolean checkIsOwner(@Param("ownerId") Long ownerId, @Param("workspaceId") Long workspaceId);

}
