package be.vives.ti.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateIngredientRequest(
        @NotBlank(message = "Name is required")
        String name,
        Integer cropId
) {
}
