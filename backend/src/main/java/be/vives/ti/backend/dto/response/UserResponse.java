package be.vives.ti.backend.dto.response;

public record UserResponse(
        Integer id,
        String userName,
        String userEmail,
        String role
) {
}
