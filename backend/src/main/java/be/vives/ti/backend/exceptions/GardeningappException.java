package be.vives.ti.backend.exceptions;

public class GardeningappException extends RuntimeException {

    public GardeningappException(String message) {
        super(message);
    }

    public GardeningappException(String message, Throwable cause) {
        super(message, cause);
    }
}