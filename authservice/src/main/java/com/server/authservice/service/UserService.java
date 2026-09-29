package com.server.authservice.service;

import com.server.authservice.dto.UserDTO;
import com.server.authservice.model.User;
import com.server.authservice.repository.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

//Custom service to manage users
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepo userRepo;

    // Method to get user by id
    public UserDTO getUserById(Long id) {
        return userRepo.findById(id)
                .map(u -> {
                    log.info("Fetched user with id: {}", id);
                    return UserDTO.builder()
                            .name(u.getName())
                            .email(u.getEmail())
                            .avatar(u.getAvatar())
                            .id(id)
                            .build();
                }).orElseThrow(() -> {
                    log.warn("user not found with id: {}", id);
                    return new EntityNotFoundException("User not found: " + id);
                });
    }

    // Method to get users by user Ids
    public List<UserDTO> getUsersByIds(List<Long> userIds) {
        log.info("Fetching users for {} user IDs", userIds.size());
        return userRepo.findAllByIdIn(userIds).stream().map(u -> UserDTO.builder().name(u.getName()).email(u.getEmail())
                .id(u.getId()).avatar(u.getAvatar()).build()).toList();
    }

    // Find users by email
    public List<UserDTO> searchUsersByEmail(String email, String excludedEmail) {
        log.info("fetching user with email: {} and not equal to: {}", email, excludedEmail);

        return userRepo.findByEmailStartingWithIgnoreCaseAndEmailNot(email, excludedEmail).stream()
                .map(user -> UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .avatar(user.getAvatar())
                        .build())
                .toList();

    }

    // Method to get user by email
    public UserDTO getUserByEmail(String email) {
        log.info("Fetching user with email: {}", email);
        User user = userRepo.findByEmail(email).orElseThrow(() -> {
            log.warn("user not found with email: {}", email);

            return new EntityNotFoundException("User not found with email: " + email);
        });

        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .build();
    }
}
