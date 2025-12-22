package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.response.CourseResponse;
import be.vives.ti.backend.exceptions.GlobalExceptionHandler;
import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.service.CourseService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import org.mockito.Mockito;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(controllers = CourseController.class)
@Import({GlobalExceptionHandler.class, CourseControllerTest.TestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseService courseService;

    @Test
    @DisplayName("GET /api/courses - when courses exist returns 200 and list")
    void getAllCourses_returnsList() throws Exception {
        // arrange
        CourseResponse c1 = new CourseResponse(1, "Course One");
        CourseResponse c2 = new CourseResponse(2, "Course Two");
        doReturn(List.of(c1, c2)).when(courseService).findAll();

        // act & assert
        mockMvc.perform(get("/api/courses").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Course One"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Course Two"));
    }

    @Test
    @DisplayName("GET /api/courses - when service throws -> returns 500")
    void getAllCourses_whenServiceThrows_returnsInternalServerError() throws Exception {
        // arrange
        doThrow(new IllegalStateException("boom")).when(courseService).findAll();

        // act & assert
        mockMvc.perform(get("/api/courses").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @TestConfiguration
    public static class TestConfig {
        // keep reference so tests can access and stub the mock if needed
        static CourseService courseServiceMock = Mockito.mock(CourseService.class);
        static JwtUtil jwtUtilMock = Mockito.mock(JwtUtil.class);
        static UserDetailsService userDetailsServiceMock = Mockito.mock(UserDetailsService.class);

        @Bean
        public CourseService courseService() {
            return courseServiceMock;
        }

        @Bean
        public JwtUtil jwtUtil() {
            return jwtUtilMock;
        }

        @Bean
        public UserDetailsService userDetailsService() {
            return userDetailsServiceMock;
        }
    }
}

