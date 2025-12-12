package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Ingredient;
import be.vives.ti.backend.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Integer> {
    Optional<Recipe> findByRecipeName(String recipeName);
    @Query("SELECT r FROM Recipe r JOIN FETCH r.quantities q JOIN FETCH q.ingredient i WHERE i.id = :ingredientID")
    Page<Recipe> findByIngredientID(int ingredientID, Pageable pageable);
    Page<Recipe> findByCategory_Id(int categoryId, Pageable pageable);
    Page<Recipe> findByCourse_Id(int courseId, Pageable pageable);


}
