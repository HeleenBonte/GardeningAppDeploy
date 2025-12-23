package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RecipeRepository extends JpaRepository<Recipe, Integer> {
    Optional<Recipe> findByRecipeName(String recipeName);
    @Query("SELECT r FROM Recipe r JOIN FETCH r.quantities q JOIN FETCH q.ingredient i WHERE i.id = :ingredientID")
    Page<Recipe> findByIngredientID(int ingredientID, Pageable pageable);

    // non-paginated overload used by some service logic/tests to quickly check whether any recipe uses an ingredient
    @Query("SELECT r FROM Recipe r JOIN r.quantities q JOIN q.ingredient i WHERE i.id = :ingredientID")
    List<Recipe> findByIngredientID(int ingredientID);

    Page<Recipe> findByCategory_Id(int categoryId, Pageable pageable);

    Page<Recipe> findByCourse_Id(int courseId, Pageable pageable);
}
