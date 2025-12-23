package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.request.CreateRecipeRequest;
import be.vives.ti.backend.dto.request.UpdateRecipeRequest;
import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.model.Recipe;
import be.vives.ti.backend.model.RecipeQuantity;
import be.vives.ti.backend.model.RecipeStep;
import be.vives.ti.backend.model.Ingredient;
import be.vives.ti.backend.model.IngredientMeasurement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RecipeMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "recipeName", target = "name")
    @Mapping(source = "authorId", target = "authorId")
    @Mapping(source = "recipeDescription", target = "description")
    @Mapping(source = "cookTime", target = "cookTime")
    @Mapping(source = "prepTime", target = "prepTime")
    @Mapping(source = "imageURL", target = "imageURL")
    @Mapping(source = "courseId", target = "courseId")
    @Mapping(source = "categoryId", target = "categoryId")
    @Mapping(source = "quantities", target = "recipeQuantities")
    @Mapping(source = "steps", target = "recipeStepResponses")
    RecipeResponse toResponse(Recipe recipe);

    List<RecipeResponse.RecipeQuantityResponse> toRecipeQuantities(List<RecipeQuantity> quantities);
    @Mapping(source = "id", target = "id")
    @Mapping(source = "ingredient", target = "ingredientResponse")
    @Mapping(source = "measurement", target = "measurementResponse")
    @Mapping(source = "quantity", target = "quantity")
    RecipeResponse.RecipeQuantityResponse toRecipeQuantityResponse(RecipeQuantity quantity);
    RecipeResponse.RecipeQuantityResponse.IngredientResponse toIngredientResponse(Ingredient ingredient);
    RecipeResponse.RecipeQuantityResponse.MeasurementResponse toMeasurementResponse(IngredientMeasurement measurement);

    List<RecipeResponse.RecipeStepResponse> toRecipeStepResponses(List<RecipeStep> steps);
    @Mapping(source = "id", target = "id")
    @Mapping(source = "stepNumber", target = "stepNumber")
    @Mapping(source = "description", target = "description")
    RecipeResponse.RecipeStepResponse toRecipeStepResponse(RecipeStep step);

    @Mapping(target = "id", ignore = true)
    @Mapping(source = "name", target = "recipeName")
    @Mapping(source = "description", target = "recipeDescription")
    @Mapping(source = "prepTime", target = "prepTime")
    @Mapping(source = "cookTime", target = "cookTime")
    @Mapping(source = "imageURL", target = "imageURL")
    @Mapping(target = "quantities", ignore = true)
    @Mapping(target = "steps", ignore = true)
    Recipe toEntity(CreateRecipeRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(source = "name", target = "recipeName")
    @Mapping(source = "description", target = "recipeDescription")
    @Mapping(source = "prepTime", target = "prepTime")
    @Mapping(source = "cookTime", target = "cookTime")
    @Mapping(source = "imageURL", target = "imageURL")
    @Mapping(target = "quantities", ignore = true)
    @Mapping(target = "steps", ignore = true)
    void updateEntity(UpdateRecipeRequest request, @MappingTarget Recipe recipe);
}
