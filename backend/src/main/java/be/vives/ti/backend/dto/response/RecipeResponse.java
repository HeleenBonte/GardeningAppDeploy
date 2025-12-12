package be.vives.ti.backend.dto.response;

import java.util.List;

public record RecipeResponse(
        Integer id,
        String name,
        Integer authorId,
        String description,
        String cookTime,
        String prepTime,
        String imageURL,
        Integer courseId,
        Integer categoryId,
        List<RecipeQuantityResponse> recipeQuantities,
        List<RecipeStepResponse> recipeStepResponses
) {
    public record RecipeQuantityResponse(
            Integer id,
            IngredientResponse ingredientResponse,
            MeasurementResponse measurementResponse,
            Double quantity
    ){
        public record IngredientResponse(
                Integer id,
                String name
        ){}
        public record MeasurementResponse(
                Integer id,
                String name
        ){}
    }
    public record RecipeStepResponse(
            Integer id,
            Integer stepNumber,
            String description
    ){}
}
