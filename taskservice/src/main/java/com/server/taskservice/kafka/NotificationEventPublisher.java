package com.server.taskservice.kafka;

import com.server.taskservice.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.kafka.core.KafkaTemplate;

@Component
@RequiredArgsConstructor
public class NotificationEventPublisher {


    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    // Topic where notification events will be published.
    private static final String NOTIFICATION_TOPIC = "notification-events";

    public void publish(NotificationEvent event) {

        // Use workspaceId as the Kafka key.
        // This keeps events for the same workspace ordered
        // within the same Kafka partition.
        String key = event.getWorkspaceId().toString();

        kafkaTemplate.send(
                NOTIFICATION_TOPIC,
                key,
                event
        );
    }
}