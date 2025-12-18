package be.vives.ti.backend.dto.request;

public record UpdateUserRequest(
        String userName,
        String email
        ) {}
