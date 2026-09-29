package com.server.authservice.exception;

import feign.FeignException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({ EntityNotFoundException.class, UsernameNotFoundException.class })
    ResponseEntity<ErrorResponse> handleNotFound(Exception exception, HttpServletRequest request) {
        log.warn("Resource not found: uri={}, message={}",
                request.getRequestURI(), exception.getMessage());
        return error(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", exception.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ErrorResponse> handleAccessDenied(HttpServletRequest request) {
        log.warn("Access denied: uri={}", request.getRequestURI());

        return error(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "You are not authorized to perform this action", request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining(", "));
        log.warn("Validation failed: uri={}, message={}",
                request.getRequestURI(), message);
        return error(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", message, request);
    }

    @ExceptionHandler({ HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class })
    ResponseEntity<ErrorResponse> handleMalformedRequest(HttpServletRequest request) {
        log.warn("Malformed request: uri={}", request.getRequestURI());
        return error(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", "The request contains invalid data", request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException exception, HttpServletRequest request) {
        log.warn("Invalid request: uri={}, message={}",
                request.getRequestURI(), exception.getMessage());

        return error(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", exception.getMessage(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorResponse> handleConflict(HttpServletRequest request) {
        log.warn("Data integrity violation: uri={}",
                request.getRequestURI());
        return error(HttpStatus.CONFLICT, "DATA_CONFLICT", "The request conflicts with existing data", request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ErrorResponse> handleUnexpected(Exception exception, HttpServletRequest request) {
        log.error("Unexpected error: uri={}",
                request.getRequestURI(), exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "An unexpected error occurred",
                request);
    }

    private ResponseEntity<ErrorResponse> error(HttpStatus status, String code, String message,
            HttpServletRequest request) {
        String safeMessage = message == null || message.isBlank() ? status.getReasonPhrase() : message;
        return ResponseEntity.status(status).body(new ErrorResponse(
                Instant.now(), status.value(), code, safeMessage, request.getRequestURI()));
    }
}