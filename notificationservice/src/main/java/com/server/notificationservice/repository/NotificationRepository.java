package com.server.notificationservice.repository;

import com.server.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications of the authenticated user.
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    // Get only unread notifications of the authenticated user.
    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(
            Long recipientId
    );

    // Count unread notifications of the authenticated user.
    long countByRecipientIdAndReadFalse(Long recipientId);

    // Mark one notification as read, but only if it belongs to the given user.
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.read = true
            WHERE n.id = :notificationId
            AND n.recipientId = :recipientId
            """)
    int markAsRead(
            @Param("notificationId") Long notificationId,
            @Param("recipientId") Long recipientId
    );

    // Mark all unread notifications of the given user as read.
    @Modifying
    @Query("""
            UPDATE Notification n
            SET n.read = true
            WHERE n.recipientId = :recipientId
            AND n.read = false
            """)
    int markAllAsRead(@Param("recipientId") Long recipientId);
}
