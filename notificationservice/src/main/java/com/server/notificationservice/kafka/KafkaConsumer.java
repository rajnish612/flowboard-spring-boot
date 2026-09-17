package com.server.notificationservice.kafka;


import com.server.notificationservice.dto.NotificationEvent;
import com.server.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KafkaConsumer {

    private final NotificationService notificationService;

    // Consume notification events published by other services.
    @KafkaListener(topics = "notification-events")
    public void consume(NotificationEvent event) {
        log.info("kafka consumer event: {}", event);
        // Pass the event to the notification business logic.
        notificationService.processNotificationEvent(event);
    }
}
