package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.response.CategoryResponse;
import be.vives.ti.backend.model.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);
}
