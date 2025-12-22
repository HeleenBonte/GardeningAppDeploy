package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.response.MeasurementResponse;
import be.vives.ti.backend.mapper.MeasurementMapper;
import be.vives.ti.backend.model.IngredientMeasurement;
import be.vives.ti.backend.repository.IngredientMeasurementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MeasurementServiceTest {

    @Mock
    private IngredientMeasurementRepository measurementRepository;

    @Mock
    private MeasurementMapper measurementMapper;

    @InjectMocks
    private MeasurementService measurementService;

    @BeforeEach
    void setUp() {
        // Mockito will initialize mocks and inject them into measurementService
    }

    @Test
    void findAll_returnsMappedResponses() {
        // Arrange
        IngredientMeasurement m1 = new IngredientMeasurement("kg");
        IngredientMeasurement m2 = new IngredientMeasurement("g");

        MeasurementResponse r1 = new MeasurementResponse(1, "kg");
        MeasurementResponse r2 = new MeasurementResponse(2, "g");

        when(measurementRepository.findAll()).thenReturn(List.of(m1, m2));

        // Stub the mapper based on the incoming object's name so the test is robust
        when(measurementMapper.toResponse(any(IngredientMeasurement.class))).thenAnswer(invocation -> {
            IngredientMeasurement arg = invocation.getArgument(0);
            if ("kg".equals(arg.getName())) return r1;
            if ("g".equals(arg.getName())) return r2;
            return null;
        });

        // Act
        List<MeasurementResponse> result = measurementService.findAll();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        // order is not important for this service-level test, assert both responses are present
        assertTrue(result.contains(r1), "Result should contain kg response");
        assertTrue(result.contains(r2), "Result should contain g response");

        verify(measurementRepository, times(1)).findAll();
        verify(measurementMapper, times(2)).toResponse(any(IngredientMeasurement.class));
    }

    @Test
    void findAll_whenRepositoryThrows_shouldPropagateException() {
        // Arrange
        when(measurementRepository.findAll()).thenThrow(new RuntimeException("boom"));

        // Act & Assert
        RuntimeException ex = assertThrows(RuntimeException.class, () -> measurementService.findAll());
        assertEquals("boom", ex.getMessage());

        verify(measurementRepository, times(1)).findAll();
        verifyNoInteractions(measurementMapper);
    }
}
