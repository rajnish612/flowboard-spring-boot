package com.server.monolith.task.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record MoveCardRequest(
        @NotNull(message = "targetListId is required")
        @Positive(message = "targetListId must be positive")
        Long targetListId,

        @NotNull(message = "position is required")
        @PositiveOrZero(message = "position must not be negative")
        Integer position
) {
}