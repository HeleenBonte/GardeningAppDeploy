package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecipeRepository extends JpaRepository<Recipe, Integer> {
    List<Recipe> findByIngredient(String ingredientName);
}
