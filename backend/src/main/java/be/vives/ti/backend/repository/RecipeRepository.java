package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Ingredient;
import be.vives.ti.backend.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Integer> {
    @Query("SELECT r FROM Recipe r JOIN FETCH r.quantities q JOIN FETCH q.ingredient i WHERE i.id = :ingredientID")
    Optional<List<Recipe>> findByIngredientID(int ingredientID);
}
