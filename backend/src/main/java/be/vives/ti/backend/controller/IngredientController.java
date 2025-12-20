package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.request.CreateIngredientRequest;
import be.vives.ti.backend.dto.response.IngredientResponse;
import be.vives.ti.backend.service.IngredientService;
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

@RestController
@RequestMapping("/api/ingredients")
@Tag(name = "Ingredient Management", description = "APIs for managing Ingredients")
public class IngredientController {
    private static final Logger log = LoggerFactory.getLogger(IngredientController.class);
    private final IngredientService ingredientService;
    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }
    //GET ALL INGREDIENTS
    @GetMapping
    @Operation(
            summary = "Get all ingredients",
            description = "Retrieves a list of all ingredients."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved ingredients",
                    content = @Content(schema = @Schema(implementation = Page.class))
            )
    })
    public ResponseEntity<Page<IngredientResponse>> getAllIngredients(@ParameterObject Pageable pageable) {
        log.debug("GET /api/ingredients");
        log.debug("GET /api/ingredients");
        Page<IngredientResponse> ingredients = ingredientService.findAll(pageable);
        return ResponseEntity.ok(ingredients);
    }

    //ADD NEW INGREDIENT
    @PostMapping
    @Operation(
            summary = "Create a new ingredient",
            description = "Creates a new ingredient with the provided details."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Ingredient created successfully",
                    content = @Content(schema = @Schema(implementation = IngredientResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid input data"
            )
    })
    public ResponseEntity<IngredientResponse> create(@Valid @RequestBody CreateIngredientRequest request){
        log.debug("POST /api/ingredients - {}", request);
        IngredientResponse createdIngredient = ingredientService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdIngredient.id())
                .toUri();

        return ResponseEntity.created(location).body(createdIngredient);
    }
    //DELETE INGREDIENT
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete an ingredient",
            description = "Deletes an ingredient by its ID."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Ingredient deleted successfully"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Ingredient not found"
            )
    })
    public ResponseEntity<?> delete(@PathVariable int id) {
        log.debug("DELETE /api/ingredients/{}", id);
        if(!ingredientService.delete(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }
}
