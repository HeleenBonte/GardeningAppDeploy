package be.vives.ti.backend.controller;


import be.vives.ti.backend.dto.response.UserResponse;
import be.vives.ti.backend.service.CropService;
import be.vives.ti.backend.service.RecipeService;
import be.vives.ti.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(exposedHeaders = "*")
@RequestMapping("/api/users")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final RecipeService recipeService;
    private final CropService cropService;
    public UserController(UserService userService, RecipeService recipeService, CropService cropService){
        this.userService = userService;
        this.recipeService = recipeService;
        this.cropService = cropService;
    }
    //POST NEW USER

    //GET ALL USERS
    @GetMapping
    @Operation(
            summary = "Get all users",
            description = """
                    Retrieves a paginated list of all users. Requires USER or ADMIN role.
                    
                    **Pagination parameters** (query params):
                    - `page`: Page number (0-indexed, default: 0)
                    - `size`: Items per page (default: 20)
                    - `sort`: Sort field and direction (e.g. `id,asc` or `name,desc`)
                    """
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved users",
                    content = @Content(schema = @Schema(implementation = Page.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            )
    })
    public ResponseEntity<Page<UserResponse>> getAllUsers(@ParameterObject Pageable pageable){
        log.debug("GET /api/users");
        Page<UserResponse> users = userService.findAll(pageable);
        return ResponseEntity.ok(users);
    }

    //GET CURRENT USER (ID)

    //GET FAVORITE CROPS

    //POST ADD FAVORITE CROP

    //DELETE FAVORITE CROP

    //GET FAVORITE RECIPES

    //POST ADD FAVORITE RECIPE

    //DELETE FAVORITE RECIPE

    //UPDATE CURRENT USER (ID)

    //DELETE
}
