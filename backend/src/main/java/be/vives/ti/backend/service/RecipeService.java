package be.vives.ti.backend.service;


import be.vives.ti.backend.dto.request.CreateRecipeRequest;
import be.vives.ti.backend.dto.request.UpdateRecipeRequest;
import be.vives.ti.backend.exceptions.RecipeException;
import be.vives.ti.backend.mapper.RecipeMapper;
import be.vives.ti.backend.model.*;
import be.vives.ti.backend.repository.CategoryRepository;
import be.vives.ti.backend.repository.CourseRepository;
import be.vives.ti.backend.repository.RecipeRepository;
import be.vives.ti.backend.repository.UserRepository;
import be.vives.ti.backend.repository.IngredientRepository;
import be.vives.ti.backend.repository.IngredientMeasurementRepository;
import be.vives.ti.backend.dto.response.RecipeResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

import java.util.Optional;


@Service
@Transactional
public class RecipeService {
    private static final Logger log = LoggerFactory.getLogger(RecipeService.class);

    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final IngredientRepository ingredientRepository;
    private final IngredientMeasurementRepository measurementRepository;

    public RecipeService(RecipeRepository recipeRepository, RecipeMapper recipeMapper, CourseRepository courseRepository, CategoryRepository categoryRepository, UserRepository userRepository, IngredientRepository ingredientRepository, IngredientMeasurementRepository measurementRepository){
        this.recipeRepository = recipeRepository;
        this.recipeMapper = recipeMapper;
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.ingredientRepository = ingredientRepository;
        this.measurementRepository = measurementRepository;
    }

    public Page<RecipeResponse> findAll(Pageable pageable){
        log.debug("Finding all recipes with pagination: {}", pageable);
        Page<Recipe> recipePage = recipeRepository.findAll(pageable);
        return recipePage.map(recipeMapper::toResponse);
    }

    public Page<RecipeResponse> findByCatId(int id, Pageable pageable){
        log.debug("Finding recipes by category id: {} with pagination: {}", id, pageable);
        Page<Recipe> recipePage = recipeRepository.findByCategory_Id(id, pageable);
        return recipePage.map(recipeMapper::toResponse);
    }

    public RecipeResponse create(CreateRecipeRequest request){
        log.debug("Checking if recipe name is already used");
        Optional<Recipe> recipeExists = recipeRepository.findByRecipeName(request.name());
        if(recipeExists.isPresent()){
            throw new RecipeException("A recipe with the same name already exists");
        }
        log.debug("Creating new recipe: {}", request.name());
        Recipe recipe = recipeMapper.toEntity(request);

        //fill in course & category
        Course course = courseRepository.findById(request.courseId()).get();
        recipe.setCourse(course);
        Category category = categoryRepository.findById(request.categoryId()).get();
        recipe.setCategory(category);

        // set author if provided
        if (request.authorId() != null) {
            userRepository.findById(request.authorId()).ifPresent(recipe::setAuthor);
        }

        // build quantities from request (link ingredients/measurement and recipe)
        if (request.quantities() != null) {
            for (var qReq : request.quantities()) {
                RecipeQuantity rq = new RecipeQuantity();
                rq.setQuantity(qReq.quantity());
                ingredientRepository.findById(qReq.ingredientId()).ifPresent(rq::setIngredient);
                measurementRepository.findById(qReq.measurementId()).ifPresent(rq::setMeasurement);
                rq.setRecipe(recipe);
                recipe.getQuantities().add(rq);
            }
        }

        // build steps from request
        if (request.steps() != null) {
            for (var sReq : request.steps()) {
                RecipeStep rs = new RecipeStep();
                rs.setStepNumber(sReq.stepNumber());
                rs.setDescription(sReq.description());
                rs.setRecipe(recipe);
                recipe.getSteps().add(rs);
            }
        }

        Recipe savedRecipe = recipeRepository.save(recipe);
        log.info("Created recipe with id: {}", savedRecipe.getId());
        return recipeMapper.toResponse(savedRecipe);
    }

    public Page<RecipeResponse> findByIngredientId(int ingredientID, Pageable pageable){
        log.debug("Finding recipes by ingredient id: {} with pagination: {}", ingredientID, pageable);
        // Note: The custom query in the repository does not support pagination directly.
        // We fetch all matching recipes and then create a Page object manually.
        Page<Recipe> recipes = recipeRepository.findByIngredientID(ingredientID, pageable);
        return recipes.map(recipeMapper::toResponse);
    }

    public Optional<RecipeResponse> update(int id, UpdateRecipeRequest request){
        log.debug("Updating recipe with id: {}", id);
        return recipeRepository.findById(id)
                .map(recipe -> {
                    recipeMapper.updateEntity(request, recipe);

                    // update course/category if provided
                    if (request.courseId() != null) {
                        courseRepository.findById(request.courseId()).ifPresent(recipe::setCourse);
                    }
                    if (request.categoryId() != null) {
                        categoryRepository.findById(request.categoryId()).ifPresent(recipe::setCategory);
                    }

                    // replace quantities
                    recipe.getQuantities().clear();
                    if (request.quantities() != null) {
                        for (var q : request.quantities()) {
                            be.vives.ti.backend.model.RecipeQuantity rq = new be.vives.ti.backend.model.RecipeQuantity();
                            rq.setQuantity(q.quantity());
                            ingredientRepository.findById(q.ingredientId()).ifPresent(rq::setIngredient);
                            measurementRepository.findById(q.measurementId()).ifPresent(rq::setMeasurement);
                            rq.setRecipe(recipe);
                            recipe.getQuantities().add(rq);
                        }
                    }

                    // replace steps
                    recipe.getSteps().clear();
                    if (request.steps() != null) {
                        for (var s : request.steps()) {
                            be.vives.ti.backend.model.RecipeStep rs = new be.vives.ti.backend.model.RecipeStep();
                            rs.setStepNumber(s.stepNumber());
                            rs.setDescription(s.description());
                            rs.setRecipe(recipe);
                            recipe.getSteps().add(rs);
                        }
                    }

                    Recipe updatedRecipe = recipeRepository.save(recipe);
                    log.info("Updated recipe with id: {}", id);
                    return recipeMapper.toResponse(updatedRecipe);
                });
    }

    public boolean delete(int id){
        log.debug("Deleting recipe with id: {}", id);
        if(!recipeRepository.existsById(id)){
            log.warn("Recipe with id: {} not found for deletion", id);
            return false;
        }
        recipeRepository.deleteById(id);
        log.info("Deleted recipe with id: {}", id);
        return true;
    }

    public Optional<RecipeResponse> findById(int id) {
        log.debug("Finding recipe by id: {}", id);
        return recipeRepository.findById(id).map(recipeMapper::toResponse);
    }
}
