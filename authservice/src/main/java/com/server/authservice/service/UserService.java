package com.server.authservice.service;


import com.server.authservice.dto.ProfileDTO;
import com.server.authservice.model.User;
import com.server.authservice.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;


//Custom service to manage users
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepo userRepo;

    //Method to get users by user Ids
    public List<ProfileDTO> getUsersByIds(List<Long> userIds) {
        return userRepo.findAllByIdIn(userIds).stream().map(u -> ProfileDTO.builder().name(u.getName()).email(u.getEmail()).id(u.getId()).avatar(u.getAvatar()).build()).toList();
    }

    //Method to get user by email
    public ProfileDTO getUserByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() ->
                new UsernameNotFoundException("User not found"));

        return ProfileDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .build();
    }
}
