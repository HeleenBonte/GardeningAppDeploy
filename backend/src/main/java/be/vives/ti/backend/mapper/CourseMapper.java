package be.vives.ti.backend.mapper;


import be.vives.ti.backend.dto.response.CourseResponse;
import be.vives.ti.backend.model.Course;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CourseMapper {
    CourseResponse toResponse(Course course);

}
