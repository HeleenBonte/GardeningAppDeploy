package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.service.RecipeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/recipes")
public class RecipeController {
    private static final Logger log = LoggerFactory.getLogger(RecipeController.class);

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService){
        this.recipeService = recipeService;
    }

    @GetMapping
    public ResponseEntity<Page<RecipeResponse>> getAllRecipes(Pageable pageable){
        log.debug("GET /api/recipes");
        Page<RecipeResponse> recipes = recipeService.findAll(pageable);
        return ResponseEntity.ok(recipes);
    }
}
