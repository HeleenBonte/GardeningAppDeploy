package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CropRepository extends JpaRepository<Crop, Integer> {
    Optional<Crop> findByName(String cropName);
}
