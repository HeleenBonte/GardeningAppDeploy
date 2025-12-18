package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.request.CreateCropRequest;
import be.vives.ti.backend.dto.request.UpdateCropRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.model.Crop;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CropMapper {
    CropResponse toResponse(Crop crop);

    List<CropResponse> toResponseList(List<Crop> crops);


    Crop toEntity(CreateCropRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(UpdateCropRequest request, @MappingTarget Crop crop);
}
