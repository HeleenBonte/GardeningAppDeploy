package be.vives.ti.backend.mapper;


import be.vives.ti.backend.dto.response.MeasurementResponse;
import be.vives.ti.backend.model.IngredientMeasurement;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MeasurementMapper {
    MeasurementResponse toResponse(IngredientMeasurement measurement);
}
