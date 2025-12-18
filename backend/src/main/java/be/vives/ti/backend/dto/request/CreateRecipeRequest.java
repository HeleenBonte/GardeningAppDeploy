package be.vives.ti.backend.dto.request;

import be.vives.ti.backend.model.IngredientMeasurement;
import be.vives.ti.backend.model.RecipeStep;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Request object for creating a new recipe")
public record CreateRecipeRequest(
        @NotBlank(message = "Name is required")
        String name,
        Integer authorId,
        @NotBlank(message = "Description is required")
        String description,
        @NotBlank(message = "PrepTime is required")
        String prepTime,
        @NotBlank(message = "Cooktime is required")
        String cookTime,
        @NotBlank(message = "Image URL is required")
        String imageURL,
        @NotNull(message = "Course id is required")
        Integer courseId,
        @NotNull(message = "Category id is required")
        Integer categoryId,
        @NotEmpty(message = "Recipe must contain at least one ingredient")
        List<CreateQuantityRequest> quantities,
        @NotEmpty(message = "Recipe must contain at least one step")
        List<CreateRecipeStepRequest> steps
) {
    public record CreateQuantityRequest(
            @NotNull(message = "Ingredient id is required")
            Integer ingredientId,
            @NotNull(message = "Measurement id is required")
            Integer measurementId,
            @NotNull(message = "Quantity is required")
            @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than zero")
            BigDecimal quantity
    ){
    }
    public record CreateRecipeStepRequest(
            @NotNull(message = "Step number is required")
            Integer stepNumber,
            @NotBlank(message = "Description is required")
            String description
    ){}
}
