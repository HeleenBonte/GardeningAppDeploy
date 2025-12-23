package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.response.CourseResponse;
import be.vives.ti.backend.dto.response.ErrorResponse;
import be.vives.ti.backend.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@Tag(name = "Course Management", description = "APIs for managing Courses")
public class CourseController {
    private static final Logger log = LoggerFactory.getLogger(CourseController.class);
    private final CourseService courseService;
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }
    @GetMapping
    @Operation(
            summary = "Get all courses",
            description = "Retrieves a list of all courses."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved courses"
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Internal server error",
                    content = @io.swagger.v3.oas.annotations.media.Content(schema = @io.swagger.v3.oas.annotations.media.Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        log.debug("GET /api/courses");
        log.debug("GET /api/courses");
        List<CourseResponse> courses = courseService.findAll();
        return ResponseEntity.ok(courses);
    }
}
