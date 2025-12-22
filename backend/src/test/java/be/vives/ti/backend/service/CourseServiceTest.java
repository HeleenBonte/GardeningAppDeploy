package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.response.CourseResponse;
import be.vives.ti.backend.mapper.CourseMapper;
import be.vives.ti.backend.model.Course;
import be.vives.ti.backend.repository.CourseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseMapper courseMapper;

    @InjectMocks
    private CourseService courseService;

    @Test
    void findAll_returnsMappedResponses() {
        // Arrange
        Course c1 = new Course("Breakfast");
        Course c2 = new Course("Dinner");
        when(courseRepository.findAll()).thenReturn(List.of(c1, c2));

        // Map any Course to a CourseResponse using the actual Course name (deterministic)
        when(courseMapper.toResponse(any())).thenAnswer(invocation -> {
            Course c = invocation.getArgument(0);
            return new CourseResponse(null, c.getName());
        });

        // Act
        List<CourseResponse> responses = courseService.findAll();

        // Assert
        assertThat(responses).hasSize(2);
        assertThat(responses).extracting(CourseResponse::name).containsExactly("Breakfast", "Dinner");
        verify(courseRepository, times(1)).findAll();

        // Verify mapper called twice with the expected course names in order
        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseMapper, times(2)).toResponse(captor.capture());
        List<Course> mappedCourses = captor.getAllValues();
        assertThat(mappedCourses).extracting(Course::getName).containsExactly("Breakfast", "Dinner");

        verifyNoMoreInteractions(courseMapper);
    }

    @Test
    void findAll_whenRepositoryThrows_propagatesException() {
        // Arrange
        when(courseRepository.findAll()).thenThrow(new RuntimeException("boom"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> courseService.findAll());
        verify(courseRepository, times(1)).findAll();
        verifyNoMoreInteractions(courseMapper);
    }
}
