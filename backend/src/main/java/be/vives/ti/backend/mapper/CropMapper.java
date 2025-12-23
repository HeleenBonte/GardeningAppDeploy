package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.request.CreateCropRequest;
import be.vives.ti.backend.dto.request.UpdateCropRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.model.Crop;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface CropMapper {
    CropResponse toResponse(Crop crop);

    Crop toEntity(CreateCropRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(UpdateCropRequest request, @MappingTarget Crop crop);
}
