package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.request.CreateIngredientRequest;
import be.vives.ti.backend.dto.response.IngredientResponse;
import be.vives.ti.backend.model.Ingredient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IngredientMapper {
    @Mapping(target = "id", ignore = true)
    Ingredient toEntity(CreateIngredientRequest request);

    @Mapping(target = "cropId", source = "crop.id")
    IngredientResponse toResponse(Ingredient ingredient);
}
