package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Integer> {
    Optional<Ingredient> findByCropId(Integer cropId);
    Optional<Ingredient> findByNameIgnoreCase(String name);

}
