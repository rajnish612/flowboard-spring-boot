package com.server.workspaceservice.dto;

import com.server.workspaceservice.repository.WorkSpaceRepo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {


    private Long id;
    private String email;
    private String name;
    private String avatar;
    private WorkSpaceRepo role;


}
