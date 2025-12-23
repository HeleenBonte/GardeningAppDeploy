package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.response.MeasurementResponse;
import be.vives.ti.backend.exceptions.GlobalExceptionHandler;
import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.service.MeasurementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import java.util.List;

import org.mockito.Mockito;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MeasurementController.class)
@Import({GlobalExceptionHandler.class, MeasurementControllerTest.TestConfig.class}) // ensure controller advice and test beans are present
@AutoConfigureMockMvc(addFilters = false) // disable security filters for controller slice testing
public class MeasurementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MeasurementService measurementService; // autowired mock from TestConfig

    @BeforeEach
    void resetMocks() {
        // ensure the shared mock is reset between tests to avoid stubbing leakage
        Mockito.reset(TestConfig.measurementServiceMock, TestConfig.jwtUtilMock);
    }

    @Test
    @DisplayName("GET /api/measurements - when measurements exist returns 200 and list")
    void getAllMeasurements_returnsList() throws Exception {
        // arrange
        MeasurementResponse m1 = new MeasurementResponse(1, "kg");
        MeasurementResponse m2 = new MeasurementResponse(2, "g");
        when(measurementService.findAll()).thenReturn(List.of(m1, m2));

        // act & assert
        mockMvc.perform(get("/api/measurements")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("kg"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("g"));
    }

    @Test
    @DisplayName("GET /api/measurements - when service throws -> returns internal server error")
    void getAllMeasurements_whenServiceThrows_returnsInternalServerError() throws Exception {
        // arrange - stub the autowired mock to throw
        doThrow(new RuntimeException("boom")).when(measurementService).findAll();

        // act & assert - expect internal server error handled by GlobalExceptionHandler
        mockMvc.perform(get("/api/measurements")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    // Test configuration that registers Mockito mock as Spring bean (avoids deprecated @MockBean)
    @TestConfiguration
    public static class TestConfig {

        // keep reference so tests can access and stub the mock if needed
        static MeasurementService measurementServiceMock = Mockito.mock(MeasurementService.class);

        // also provide JwtUtil mock so security filter beans can be constructed in the test context
        static JwtUtil jwtUtilMock = Mockito.mock(JwtUtil.class);

        @Bean
        @Primary
        public MeasurementService measurementService() {
            return measurementServiceMock;
        }

        @Bean
        @Primary
        public JwtUtil jwtUtil() {
            return jwtUtilMock;
        }
    }
}
