package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.request.CreateIngredientRequest;
import be.vives.ti.backend.dto.response.CourseResponse;
import be.vives.ti.backend.dto.response.IngredientResponse;
import be.vives.ti.backend.dto.response.MeasurementResponse;
import be.vives.ti.backend.exceptions.IngredientException;
import be.vives.ti.backend.mapper.CourseMapper;
import be.vives.ti.backend.mapper.IngredientMapper;
import be.vives.ti.backend.mapper.MeasurementMapper;
import be.vives.ti.backend.model.Course;
import be.vives.ti.backend.model.Ingredient;
import be.vives.ti.backend.model.IngredientMeasurement;
import be.vives.ti.backend.repository.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {
    private static final Logger log = LoggerFactory.getLogger(CourseService.class);

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    public CourseService(CourseRepository courseRepository, CourseMapper courseMapper) {
        this.courseRepository = courseRepository;
        this.courseMapper = courseMapper;
    }

    public List<CourseResponse> findAll() {
        log.debug("Finding all courses");
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(courseMapper::toResponse)
                .toList();
    }

}
