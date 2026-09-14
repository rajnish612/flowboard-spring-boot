package com.server.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


//DATA TRANSFER OBJECT TO RETURN USER INFO AS HTTP RESPONSE
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDTO {
    private Long id;

    @Email(message = "email must be valid")
    private String email;

    @Size(max = 100, message = "name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "avatar must not exceed 500 characters")
    private String avatar;
}
