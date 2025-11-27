package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.model.Recipe;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RecipeMapper {
    RecipeResponse toResponse(Recipe recipe);
}
