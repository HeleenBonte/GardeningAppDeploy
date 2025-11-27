package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.request.CreateIngredientRequest;
import be.vives.ti.backend.model.Ingredient;
import org.mapstruct.Mapping;

public interface IngredientMapper {
    @Mapping(target = "id", ignore = true)
    Ingredient toEntity(CreateIngredientRequest request);
}
