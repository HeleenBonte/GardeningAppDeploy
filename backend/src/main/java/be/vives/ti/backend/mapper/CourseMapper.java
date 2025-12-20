package be.vives.ti.backend.mapper;


import be.vives.ti.backend.dto.response.CourseResponse;
import be.vives.ti.backend.model.Course;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseResponse toResponse(Course course);

}
