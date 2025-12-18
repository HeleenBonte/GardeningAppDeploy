package be.vives.ti.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Request object for updating a recipe")
public record UpdateRecipeRequest(
    String name,
    String description,
    String prepTime,
    String cookTime,
    String imageURL,
    Integer courseId,
    Integer categoryId,
    List<UpdateQuantityRequest> quantities,
    List<UpdateRecipeStepRequest> steps
) {
    public record UpdateQuantityRequest(
            Integer ingredientId,
            Integer measurementId,
            @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than zero")
            BigDecimal quantity
    ){}
    public record UpdateRecipeStepRequest(
            Integer stepNumber,
            String description
    ){}
}

