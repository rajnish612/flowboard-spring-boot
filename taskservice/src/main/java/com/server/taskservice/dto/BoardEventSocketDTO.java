package com.server.taskservice.dto;

import lombok.*;


//DTO object for the purpose of transferring data through socket events
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardEventSocketDTO<T> {
    private Long userId;
    private String type;
    private Long boardId;
    private T data;
}
