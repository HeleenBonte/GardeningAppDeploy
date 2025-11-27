package be.vives.ti.backend.dto.response;

public record RecipeResponse(
        Integer id,
        String name,
        Integer authorId,
        String description,
        String cookTime,
        String prepTime,
        String imageURL,
        Integer courseId,
        Integer categoryId
) {

}
