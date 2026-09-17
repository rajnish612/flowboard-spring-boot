package com.server.taskservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {
    // Topic used to send events from Task Service
    // to Notification Service.
    @Bean
    public NewTopic notificationTopic() {
        return new NewTopic(
                "notification-events",
                3,      // Number of partitions
                (short) 1// Replication factor for local development
        );
    }
}
