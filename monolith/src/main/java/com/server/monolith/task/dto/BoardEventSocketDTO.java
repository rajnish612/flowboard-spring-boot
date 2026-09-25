package com.server.monolith.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


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
