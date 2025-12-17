package be.vives.ti.backend.controller;


import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.service.CropService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crops")
@Tag(name = "Crop Management", description = "APIs for managing Crops")
public class CropController {
    private static final Logger log = LoggerFactory.getLogger(CropController.class);

    private final CropService cropService;
    public CropController(CropService cropService){
        this.cropService = cropService;
    }
    //GET ALL
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
        @ApiResponse(responseCode = "400", description = "Invalid pagination parameters supplied"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getAll(@ParameterObject Pageable pageable){
        log.debug("GET /api/crops");
        Page<CropResponse> crops = cropService.findAll(pageable);
        return ResponseEntity.ok(crops);
    }

    //GET BY ID
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
            )
    })
    public ResponseEntity<?> getById(
            @Parameter(description = "id", required = true)
            @PathVariable int id){
        log.debug("GET /api/crops/{}", id);
        var crop = cropService.findById(id);
        if (crop == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(crop);
    }
    //GET BY NAME

    //GET BY INHOUSE

    //GET BY INGARDEN

    //GET BY INGREENHOUSE

    //GET BY INPOTS

    //POST ADD NEW

    //UPDATE BY ID (NEW TIPS/ NAME/...)

    //DELETE BY ID


}
