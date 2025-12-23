package be.vives.ti.backend.dto.response;

public record UserResponse(
        Integer id,
        String userName,
        String userEmail,
        String role
) {
    // Keep explicit accessors for compatibility with existing tests/controllers
    public String getUserName() { return userName; }
    public Integer getId() { return id; }
    public String getUserEmail() { return userEmail; }
    public String getRole() { return role; }
}
