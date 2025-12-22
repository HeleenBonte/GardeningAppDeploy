package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.response.MeasurementResponse;
import be.vives.ti.backend.service.MeasurementService;
import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.exceptions.GlobalExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Primary;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;

import org.mockito.Mockito;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MeasurementController.class)
@Import({GlobalExceptionHandler.class, MeasurementControllerTest.TestConfig.class}) // ensure controller advice and test config are present in test context
@AutoConfigureMockMvc(addFilters = false) // disable security filters for controller slice testing
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD) // ensure a fresh context per test to avoid cross-test contamination
public class MeasurementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // autowire the MeasurementService bean (will be the Mockito mock provided by TestConfig)
    @Autowired
    private MeasurementService measurementService;

    @Test
    @DisplayName("GET /api/measurements - when measurements exist returns 200 and list")
    void getAllMeasurements_returnsList() throws Exception {
        // arrange
        MeasurementResponse m1 = new MeasurementResponse(1, "kg");
        MeasurementResponse m2 = new MeasurementResponse(2, "g");
        doReturn(List.of(m1, m2)).when(measurementService).findAll();

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
    @DisplayName("GET /api/measurements - when service throws -> returns 500")
    void getAllMeasurements_whenServiceThrows_returnsInternalServerError() throws Exception {
        // arrange - use doThrow to avoid invoking real method
        doThrow(new IllegalStateException("boom")).when(measurementService).findAll();

        // act & assert
        mockMvc.perform(get("/api/measurements")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    // Test configuration that registers Mockito mocks as Spring beans (avoids deprecated @MockBean)
    @TestConfiguration
    public static class TestConfig {

        @Bean
        @Primary
        public MeasurementService measurementService() {
            return Mockito.mock(MeasurementService.class);
        }

        @Bean
        public JwtUtil jwtUtil() {
            return Mockito.mock(JwtUtil.class);
        }

        @Bean
        public UserDetailsService userDetailsService() {
            return Mockito.mock(UserDetailsService.class);
        }
    }
}
