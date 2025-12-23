package be.vives.ti.backend.mapper;


import be.vives.ti.backend.dto.response.MeasurementResponse;
import be.vives.ti.backend.model.IngredientMeasurement;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MeasurementMapper {
    MeasurementResponse toResponse(IngredientMeasurement measurement);
}
