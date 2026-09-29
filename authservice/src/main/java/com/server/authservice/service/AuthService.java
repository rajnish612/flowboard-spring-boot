package com.server.authservice.service;

import com.server.authservice.model.User;
import com.server.authservice.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;


//Custom service to manage auth and REMOVEDs
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepo userRepo;


    //    METHOD TO RETRIEVE USER DETAILS FROM DB USING USER's EMAIL
    public User retrieveUserThroughEmailElseSave(User user) {
        Optional<User> existingUser = userRepo.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            log.debug("User already exists with email: {}", user.getEmail());
            return existingUser.get();
        }
        userRepo.save(user);

        log.info("Created new user with email: {}", user.getEmail());
        return user;

    }
}
