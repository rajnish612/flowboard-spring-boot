package com.server.authservice.repository;

import com.server.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


// Repository used to interact with the User table in the database
public interface UserRepo extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}
