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
    private final UserRepo REMOVEDRepo;


    //    METHOD TO RETRIEVE USER DETAILS FROM DB USING USER's EMAIL
    public User retrieveUserThroughEmail(User REMOVED) {
        Optional<User> existingUser = REMOVEDRepo.findByEmail(REMOVED.getEmail());
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        REMOVEDRepo.save(REMOVED);
        log.info("Successfully retrieved or created REMOVED: {}", REMOVED.getEmail());
        return REMOVED;

    }
}
