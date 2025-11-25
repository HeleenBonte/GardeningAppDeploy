package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.RecipeStep;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecipeStepRepository extends JpaRepository<RecipeStep, Integer> {
}
