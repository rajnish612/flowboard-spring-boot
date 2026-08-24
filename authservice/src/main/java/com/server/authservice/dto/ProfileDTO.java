package com.server.authservice.dto;

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
    private String email;
    private String name;
    private String avatar;
}
