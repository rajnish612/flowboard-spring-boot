package com.server.authservice.service;

import com.server.authservice.model.User;
import com.server.authservice.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo REMOVEDRepo;

    public User oauthLogin(User REMOVED) {
        Optional<User> existingUser = REMOVEDRepo.findByEmail(REMOVED.getEmail());
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        REMOVEDRepo.save(REMOVED);
        return REMOVED;

    }
}
