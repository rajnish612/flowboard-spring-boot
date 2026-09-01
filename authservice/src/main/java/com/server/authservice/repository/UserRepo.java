package com.server.authservice.repository;

import com.server.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


// Repository used to interact with the User table in the database
public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    //Get users my multiple user Ids together
    List<User> findAllByIdIn(List<Long> userIds);
}
