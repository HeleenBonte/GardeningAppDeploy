package be.vives.ti.backend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

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
            Double quantity
    ){}
    public record UpdateRecipeStepRequest(
            Integer stepNumber,
            String description
    ){}
}

