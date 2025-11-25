package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.IngredientMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngredientMeasurementRepository extends JpaRepository<IngredientMeasurement, Integer> {
}
