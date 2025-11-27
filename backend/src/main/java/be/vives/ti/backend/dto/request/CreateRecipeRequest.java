package be.vives.ti.backend.dto.request;

import be.vives.ti.backend.model.IngredientMeasurement;
import be.vives.ti.backend.model.RecipeStep;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

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
        @NotBlank(message = "Course id is required")
        Integer courseId,
        @NotBlank(message = "Category id is required")
        Integer categoryId,
        @NotEmpty(message = "Recipe must contain at least one ingredient")
        List<QuantityRequest> quantities,
        @NotEmpty(message = "Recipe must contain at least one step")
        List<RecipeStepRequest> steps
) {
    public record QuantityRequest(
            @NotBlank(message = "Ingredient id is required")
            Integer ingredientId,
            @NotBlank(message = "Measurement id is required")
            Integer measurementId,
            @NotBlank(message = "Quantity is required")
            Double quantity
    ){
    }
    public record RecipeStepRequest(
            @NotBlank(message = "Step number is required")
            Integer stepNumber,
            @NotBlank(message = "Description is required")
            String description
    ){}
}
