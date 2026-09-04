package com.server.taskservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableFeignClients
@EnableMethodSecurity //to implement method level authorization
public class TaskserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskserviceApplication.class, args);
    }

}
