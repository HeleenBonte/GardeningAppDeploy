package be.vives.ti.backend.exceptions;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    public ResourceNotFoundException(String resourceName, int resourceId) {
        super(String.format("%s with ID %d not found", resourceName, resourceId));
    }
}
