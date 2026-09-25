package com.server.monolith.auth.service;

import com.server.monolith.auth.model.User;
import com.server.monolith.auth.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;


//Custom service to manage auth and REMOVEDs
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepo REMOVEDRepo;


    //    METHOD TO RETRIEVE USER DETAILS FROM DB USING USER's EMAIL
    public User retrieveUserThroughEmail(User user) {
        Optional<User> existingUser = REMOVEDRepo.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        REMOVEDRepo.save(user);
        log.info("Successfully retrieved or created REMOVED: {}", user.getEmail());
        return user;

    }
}
