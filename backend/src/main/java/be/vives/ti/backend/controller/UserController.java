package be.vives.ti.backend.controller;


import be.vives.ti.backend.dto.AuthResponse;
import be.vives.ti.backend.dto.request.CreateUserRequest;
import be.vives.ti.backend.dto.request.UpdateUserRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.dto.response.UserResponse;
import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.service.UserService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing users and their favorite crops and recipes")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final JwtUtil jwtUtil;
    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
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

    @GetMapping("/{id}")
    @Operation(
            summary = "Get user by ID",
            description = "Retrieves a user by their unique ID. Requires USER or ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved user",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found"
            )
    })
    public ResponseEntity<UserResponse> getUser(@Parameter(description = "User ID", required = true) @PathVariable int id){
        log.debug("GET /api/users/{}", id);
        UserResponse user = userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @Operation(
            summary = "Create new user",
            description = "Creates a new user in the system. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "User created successfully",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid user data"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            )
    })
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request){
        log.debug("POST /api/users - {}", request);
        UserResponse createdUser = userService.create(request);

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdUser.id())
                .toUri();
        return ResponseEntity.created(location).body(createdUser);
    }

    @GetMapping("/{id}/favorite-crops")
    @Operation(
            summary = "Get favorite crops of a user",
            description = "Retrieves the favorite crops of a user by their unique ID. Requires USER or ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved favorite crops"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found"
            )
    })
    public ResponseEntity<List<CropResponse>> getFavoriteCrops(@Parameter(description = "User ID", required = true) @PathVariable int id){
        log.debug("GET /api/users/{}/favorite-crops", id);
        var favoriteCrops = userService.findFavoriteCrops(id);
        return ResponseEntity.ok(favoriteCrops);
    }

    //POST ADD FAVORITE CROP
    @PostMapping("/{userId}/favorite-crops/{cropId}")
    @Operation(
            summary = "Add favorite crop to user",
            description = "Adds a crop to the user's list of favorite crops. Requires USER or ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully added favorite crop"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User or Crop not found"
            )
    })
    public ResponseEntity<Void> addFavoriteCrop(
            @Parameter(description = "User ID", required = true) @PathVariable int userId,
            @Parameter(description = "Crop ID", required = true) @PathVariable int cropId){
                log.debug("POST /api/users/{}/favorite-crops/{}", userId, cropId);
                try {
                        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                        if (auth == null) {
                                log.debug("Authentication on addFavoriteCrop: null");
                        } else {
                                log.debug("Authentication on addFavoriteCrop: principal={} authorities={}", auth.getName(), auth.getAuthorities());
                        }
                } catch (Exception ex) {
                        log.debug("Failed to read SecurityContext authentication: {}", ex.getMessage());
                }
        userService.addFavoriteCrop(userId, cropId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/favorite-crops/{cropId}")
    @Operation(
            summary = "Remove favorite crop from user",
            description = "Removes a crop from the user's list of favorite crops. Requires USER or ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully removed favorite crop"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User or Crop not found"
            )
    })
    public ResponseEntity<Void> removeFavoriteCrop(
            @Parameter(description = "User ID", required = true) @PathVariable int userId,
            @Parameter(description = "Crop ID", required = true) @PathVariable int cropId){
        log.debug("DELETE /api/users/{}/favorite-crops/{}", userId, cropId);
        userService.removeFavoriteCrop(userId, cropId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/favorite-recipes")
    @Operation(
            summary = "Get favorite recipes of a user",
            description = "Retrieves the favorite recipes of a user by their unique ID. Requires USER or ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully retrieved favorite recipes"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found"
            )
    })
    public ResponseEntity<List<RecipeResponse>> getFavoriteRecipes(@Parameter(description = "User ID", required = true) @PathVariable int id){
        log.debug("GET /api/users/{}/favorite-recipes", id);
        var favoriteRecipes = userService.getFavoriteRecipes(id);
        return ResponseEntity.ok(favoriteRecipes);
    }

    @PostMapping("/{userId}/favorite-recipes/{recipeId}")
    @Operation(
            summary = "Add favorite recipe to user",
            description = "Adds a recipe to the user's list of favorite recipes. Requires USER or ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully added favorite recipe"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User or Recipe not found"
            )
    })
    public ResponseEntity<Void> addFavoriteRecipe(
            @Parameter(description = "User ID", required = true) @PathVariable int userId,
            @Parameter(description = "Recipe ID", required = true) @PathVariable int recipeId){
        log.debug("POST /api/users/{}/favorite-recipes/{}", userId, recipeId);
        userService.addFavoriteRecipe(userId, recipeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/favorite-recipes/{recipeId}")
    @Operation(
            summary = "Remove favorite recipe from user",
            description = "Removes a recipe from the user's list of favorite recipes. Requires USER or ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully removed favorite recipe"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User or Recipe not found"
            )
    })
    public ResponseEntity<Void> removeFavoriteRecipe(
            @Parameter(description = "User ID", required = true) @PathVariable int userId,
            @Parameter(description = "Recipe ID", required = true) @PathVariable int recipeId){
        log.debug("DELETE /api/users/{}/favorite-recipes/{}", userId, recipeId);
        userService.removeFavoriteRecipe(userId, recipeId);
        return ResponseEntity.noContent().build();
    }

    //UPDATE CURRENT USER (ID)
    @PutMapping("/{id}")
    @Operation(
            summary = "Update user by ID",
            description = "Updates the details of an existing user by their unique ID. Requires USER or ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Successfully updated user",
                    content = @Content(schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid user data"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found"
            )
    })
    public ResponseEntity<AuthResponse> updateUser(
            @Parameter(description = "User ID", required = true) @PathVariable int id,
            @Valid @RequestBody UpdateUserRequest request){
        log.debug("PUT /api/users/{} - {}", id, request);
        UserResponse updatedUser = userService.update(id, request);
        String newToken = jwtUtil.generateToken(updatedUser.getUserEmail(), "USER");
        AuthResponse response = new AuthResponse(
                updatedUser.getId(),
                newToken,
                updatedUser.getUserEmail(),
                updatedUser.getUserName(),
                updatedUser.getRole()
        );
        return ResponseEntity.ok(response);
    }

    //DELETE
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete user by ID",
            description = "Deletes a user from the system by their unique ID. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Successfully deleted user"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Unauthorized - JWT token missing or invalid"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "User not found"
            )
    })
    public ResponseEntity<Void> deleteUser(@Parameter(description = "User ID", required = true) @PathVariable int id) {
        log.debug("DELETE /api/users/{}", id);
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
