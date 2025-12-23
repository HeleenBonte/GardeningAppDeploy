package be.vives.ti.backend.controller;


import be.vives.ti.backend.dto.request.CreateCropRequest;
import be.vives.ti.backend.dto.request.UpdateCropRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.dto.response.ErrorResponse;
import be.vives.ti.backend.service.CropService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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

@RestController
@RequestMapping("/api/crops")
@Tag(name = "Crop Management", description = "APIs for managing Crops")
public class CropController {
    private static final Logger log = LoggerFactory.getLogger(CropController.class);

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    @GetMapping
    @Operation(
            summary = "Get all crops",
            description = """
                    Retrieves a list of all crops. Supports pagination
                       **Pagination parameters** (query params):
                        - `page`: Page number (0-indexed, default:0)
                        - `size`: Items per page (default:20)
                        - `sort`: Sort field and direction
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved list of crops", content = @Content(schema = @Schema(implementation = Page.class))),
            @ApiResponse(responseCode = "400", description = "Invalid pagination parameters supplied", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> getAll(@ParameterObject Pageable pageable) {
        log.debug("GET /api/crops");
        Page<CropResponse> crops = cropService.findAll(pageable);
        return ResponseEntity.ok(crops);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get a recipe by ID",
            description = """
                    Retrieves a recipe by its unique ID.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved recipe"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Crop not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<?> getById(
            @Parameter(description = "id", required = true)
            @PathVariable int id) {
        log.debug("GET /api/crops/{}", id);
        var crop = cropService.findById(id);
        if (crop == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(crop);
    }

    @GetMapping("/search")
    @Operation(
            summary = "Get crops by name",
            description = """
                    Retrieves a list of crops matching the provided name.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved list of crops"
            )
    })
    public ResponseEntity<?> getByName(
            @Parameter(description = "name", required = true)
            @RequestParam String name,
            @ParameterObject Pageable pageable) {
        log.debug("GET /api/crops/search?name={}", name);
        var crops = cropService.findByNameContaining(name, pageable);
        return ResponseEntity.ok(crops);
    }

    @PostMapping
    @Operation(
            summary = "Add a new crop",
            description = """
                    Adds a new crop to the system.
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Successfully added new crop"
            )
    })
    public ResponseEntity<?> createCrop(@Valid @RequestBody CreateCropRequest request) {
        log.debug("POST /api/crops - {}", request);
        CropResponse created = cropService.create(request);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update an existing crop",
            description = """
                    Updates the details of an existing crop identified by its ID.
                    """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully updated crop"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - ADMIN role required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Crop not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<CropResponse> updateCrop(
            @Parameter(description = "ID of the crop to update", required = true)
            @PathVariable int id,
            @Valid @RequestBody UpdateCropRequest request) {
        log.debug("PUT /api/crops/{} - {}", id, request);
        return cropService.update(id, request)
                .map(updatedCrop -> ResponseEntity.ok().body(updatedCrop))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete a crop",
            description = """
                    Deletes an existing crop identified by its ID.
                    """,
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Successfully deleted crop"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - ADMIN role required",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<Void> deleteCrop(
            @Parameter(description = "ID of the crop to delete", required = true)
            @PathVariable int id) {
        log.debug("DELETE /api/crops/{}", id);
        if(cropService.delete(id)){
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
