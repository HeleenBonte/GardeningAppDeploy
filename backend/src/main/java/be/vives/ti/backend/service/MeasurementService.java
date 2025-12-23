package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.response.MeasurementResponse;
import be.vives.ti.backend.mapper.MeasurementMapper;
import be.vives.ti.backend.model.IngredientMeasurement;
import be.vives.ti.backend.repository.IngredientMeasurementRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class MeasurementService {
    private static final Logger log = LoggerFactory.getLogger(MeasurementService.class);

    private final IngredientMeasurementRepository measurementRepository;
    private final MeasurementMapper measurementMapper;

    public MeasurementService(IngredientMeasurementRepository measurementRepository, MeasurementMapper measurementMapper) {
        this.measurementRepository = measurementRepository;
        this.measurementMapper = measurementMapper;
    }

    public List<MeasurementResponse> findAll() {
        log.debug("Finding all measurements");
        List<IngredientMeasurement> measurements = measurementRepository.findAll();
        return measurements.stream()
                .map(measurementMapper::toResponse)
                .toList();
    }

}
