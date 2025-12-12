package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.request.CreateRecipeRequest;
import be.vives.ti.backend.dto.request.UpdateRecipeRequest;
import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.service.RecipeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/recipes")
@Tag(name = "Recipe Management", description = "APIs for managing Recipes")
public class RecipeController {
    private static final Logger log = LoggerFactory.getLogger(RecipeController.class);

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService){
        this.recipeService = recipeService;
    }

    @GetMapping
    @Operation(
            summary = "Get all recipes",
            description = """
                    Retrieves a list of all recipes. Supports pagination
                    **Pagination parameters** (query params):
                    - `page`: Page number (0-indexed, default:0)
                    - `size`: Items per page (default:20)
                    - `sort`: Sort field and direction
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved recipes",
                    content = @Content(schema = @Schema(implementation = Page.class))
            )
    })
    public ResponseEntity<?> getAll(@ParameterObject Pageable pageable){
        log.debug("GET /api/recipes");
        Page<RecipeResponse> recipes = recipeService.findAll(pageable);
        return ResponseEntity.ok(recipes);
    }
    //GET BY CAT ID
    @GetMapping("/category/{catId}")
    @Operation(
            summary = "get recipes by cat id",
            description = """
                          Get a list of recipes that belong to the provided category
                          
                          **Pagination parameters** (query params):
                          - `page`: Page number (0-indexed, default: 0)
                          - `size`: Items per page (default: 20)
                          - `sort`: Sort field and direction (e.g., `name,asc` or `price,desc`)
                          """
    )
    @ApiResponses(value ={
            @ApiResponse(
                    responseCode = "200",
                    description = "recipes found",
                    content = @Content(schema = @Schema(implementation = RecipeResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Recipes not found"
            )
    })
    public ResponseEntity<?> getByCatId(@Parameter(description = "Category ID", required = true) @PathVariable int catId,@ParameterObject Pageable pageable){
        log.debug("GET /api/recipes/category/{}", catId);
        Page<RecipeResponse> recipes = recipeService.findByCatId(catId, pageable);
        return ResponseEntity.ok(recipes);

    }


    //GET BY COURSE ID
    @GetMapping("/course/{courseId}")
    @Operation(
            summary = "get recipes by course id",
            description = """
                          Get a list of recipes that belong to the provided course
                          
                          **Pagination parameters** (query params):
                          - `page`: Page number (0-indexed, default: 0)
                          - `size`: Items per page (default: 20)
                          - `sort`: Sort field and direction (e.g., `name,asc` or `price,desc`)
                          """
    )
    @ApiResponses(value ={
            @ApiResponse(
                    responseCode = "200",
                    description = "recipes found",
                    content = @Content(schema = @Schema(implementation = RecipeResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Recipes not found"
            )
    })
    public ResponseEntity<?> getByCourseId(@Parameter(description = "Course ID", required = true) @PathVariable int courseId,@ParameterObject Pageable pageable){
        log.debug("GET /api/recipes/course/{}", courseId);
        Page<RecipeResponse> recipes = recipeService.findByCatId(courseId, pageable);
        return ResponseEntity.ok(recipes);
    }
    //GET BY INGR NAME(ID)
    @GetMapping("/ingredient/{ingrId}")
    @Operation(
            summary = "get recipes by ingredient id",
            description = """
                          Get a list of recipes that belong to the provided ingredient
                          
                          **Pagination parameters** (query params):
                          - `page`: Page number (0-indexed, default: 0)
                          - `size`: Items per page (default: 20)
                          - `sort`: Sort field and direction (e.g., `name,asc` or `price,desc`)
                          """
    )
    @ApiResponses(value ={
            @ApiResponse(
                    responseCode = "200",
                    description = "recipes found",
                    content = @Content(schema = @Schema(implementation = RecipeResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Recipes not found"
            )
    })
    public ResponseEntity<?> getByIngredientId(@Parameter(description = "Ingredient ID", required = true) @PathVariable int ingrId,@ParameterObject Pageable pageable){
        log.debug("GET /api/recipes/ingredient/{}", ingrId);
        Page<RecipeResponse> recipes = recipeService.findByCatId(ingrId, pageable);
        return ResponseEntity.ok(recipes);
    }
    //POST ADD NEW RECIPE
    @PostMapping
    @Operation(
            summary = "Create a new recipe",
            description = "Creates a new recipe"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Recipe created succesfully",
                    content = @Content(schema = @Schema(implementation = RecipeResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            )
    })
    public ResponseEntity<RecipeResponse> createRecipe(@RequestBody CreateRecipeRequest request){
        log.debug("POST /api/recipes - {}", request);

        RecipeResponse created = recipeService.create(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    //UPDATE RECIPE BY ID only admin
    @PutMapping("/{id}")
    @Operation(
            summary = "Update a recipe",
            description = "Updates an existing recipe. Requires ADMIN role.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Recipe updated successfully",
                    content = @Content(schema = @Schema(implementation = RecipeResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request data"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Forbidden - ADMIN role required"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Recipe not found"
            )
    })
    public ResponseEntity<RecipeResponse> updateRecipe(
            @Parameter(description = "Recipe ID", required = true) @PathVariable int id,
            @RequestBody UpdateRecipeRequest request){
        log.debug("PUT /api/recipes/{} - {}", id, request);
        return recipeService.update(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    //DELETE
}
