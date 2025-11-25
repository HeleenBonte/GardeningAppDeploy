package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.RecipeQuantity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeQuantityRepository extends JpaRepository<RecipeQuantity, Integer> {
}
