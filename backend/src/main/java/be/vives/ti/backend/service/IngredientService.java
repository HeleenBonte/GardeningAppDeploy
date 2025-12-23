package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.request.CreateIngredientRequest;
import be.vives.ti.backend.dto.response.IngredientResponse;
import be.vives.ti.backend.exceptions.IngredientException;
import be.vives.ti.backend.mapper.IngredientMapper;
import be.vives.ti.backend.model.Ingredient;
import be.vives.ti.backend.repository.IngredientRepository;
import be.vives.ti.backend.repository.RecipeRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Transactional
public class IngredientService {
    private static final Logger log = LoggerFactory.getLogger(IngredientService.class);

    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientMapper ingredientMapper;

    public IngredientService(IngredientRepository ingredientRepository, RecipeRepository recipeRepository, IngredientMapper ingredientMapper) {
        this.ingredientRepository = ingredientRepository;
        this.recipeRepository = recipeRepository;
        this.ingredientMapper = ingredientMapper;
    }

    public Page<IngredientResponse> findAll(Pageable pageable) {
        log.debug("Finding all ingredients with pagination: {}", pageable);
        Page<Ingredient> ingredientPage = ingredientRepository.findAll(pageable);
        return ingredientPage.map(ingredientMapper::toResponse);
    }

    public IngredientResponse create(CreateIngredientRequest request) {
        log.debug("Checking if ingredient name is already used");
        Optional<Ingredient> ingredientExists = ingredientRepository.findByNameIgnoreCase(request.name());
        if (ingredientExists.isPresent()) {
            throw new IngredientException("Ingredient name already in use");
        }
        log.debug("Creating new ingredient: {}", request.name());
        Ingredient ingredient = ingredientMapper.toEntity(request);

        Ingredient savedIngredient = ingredientRepository.save(ingredient);
        return ingredientMapper.toResponse(savedIngredient);
    }

    public boolean delete(int id) {
        log.debug("Deleting ingredient with id {}", id);
        if(!ingredientRepository.existsById(id)) {
            log.warn("Ingredient with id {} not found for deletion", id);
            return false;
        }
        if(!recipeRepository.findByIngredientID(id).isEmpty()) {
            log.warn("Ingredient with id {} is being used in at least one recipe", id);
            return false;
        }
        ingredientRepository.deleteById(id);
        return true;
    }
}
