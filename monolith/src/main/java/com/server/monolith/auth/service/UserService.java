package com.server.monolith.auth.service;


import com.server.monolith.auth.dto.UserDTO;
import com.server.monolith.auth.model.User;
import com.server.monolith.auth.repository.UserRepo;
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

    //Method to get user by id
    public UserDTO getUserById(Long id) {
        return userRepo.findById(id)
                .map(u -> UserDTO.builder()
                        .name(u.getName())
                        .email(u.getEmail())
                        .avatar(u.getAvatar())
                        .build())
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + id));
    }

    //Method to get users by user Ids
    public List<UserDTO> getUsersByIds(List<Long> userIds) {
        return userRepo.findAllByIdIn(userIds).stream().map(u -> UserDTO.builder().name(u.getName()).email(u.getEmail()).id(u.getId()).avatar(u.getAvatar()).build()).toList();
    }

    //Find users by email
    public List<UserDTO> searchUsersByEmail(String email, String excludedEmail) {
        return userRepo.findByEmailStartingWithIgnoreCaseAndEmailNot(email, excludedEmail).stream().map(user -> UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .build()).toList();

    }

    //Method to get user by email
    public UserDTO getUserByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() ->
            new EntityNotFoundException("User not found with email: " + email));

        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .build();
    }
}
