package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.request.CreateIngredientRequest;
import be.vives.ti.backend.dto.response.IngredientResponse;
import be.vives.ti.backend.dto.response.MeasurementResponse;
import be.vives.ti.backend.service.IngredientService;
import be.vives.ti.backend.service.MeasurementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/measurements")
@Tag(name = "Measurement Management", description = "APIs for managing Measurements")
public class MeasurementController {
    private static final Logger log = LoggerFactory.getLogger(MeasurementController.class);
    private final MeasurementService measurementService;
    public MeasurementController(MeasurementService measurementService) {
        this.measurementService = measurementService;
    }
    //GET ALL MEASUREMENTS
    @GetMapping
    @Operation(
            summary = "Get all measurements",
            description = "Retrieves a list of all measurements."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved measurements"
            )
    })
    public ResponseEntity<List<MeasurementResponse>> getAllMeasurements() {
        log.debug("GET /api/measurements");
        log.debug("GET /api/measurements");
        List<MeasurementResponse> measurements = measurementService.findAll();
        return ResponseEntity.ok(measurements);
    }
}
