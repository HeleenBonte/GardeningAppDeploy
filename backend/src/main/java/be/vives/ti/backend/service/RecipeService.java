package be.vives.ti.backend.service;


import be.vives.ti.backend.mapper.RecipeMapper;
import be.vives.ti.backend.model.Recipe;
import be.vives.ti.backend.repository.RecipeRepository;
import be.vives.ti.backend.dto.response.RecipeResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

@Service
@Transactional
public class RecipeService {
    private final RecipeRepository recipeRepository;
    private final RecipeMapper recipeMapper;
    public RecipeService(RecipeRepository recipeRepository, RecipeMapper recipeMapper){
        this.recipeRepository = recipeRepository;
        this.recipeMapper = recipeMapper;
    }

    public Page<RecipeResponse> findAll(Pageable pageable){
        Page<Recipe> recipePage = recipeRepository.findAll(pageable);
        return recipePage.map(recipeMapper::toResponse);
    }
}
