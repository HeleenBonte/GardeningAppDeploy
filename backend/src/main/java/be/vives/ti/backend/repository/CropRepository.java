package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CropRepository extends JpaRepository<Crop, Integer> {
    Optional<Crop> findByName(String cropName);


    List<Crop> findByInHouse(Boolean bool);
    List<Crop> findByInGarden(Boolean bool);
    List<Crop> findByInGreenhouse(Boolean bool);
    List<Crop> findByInPots(Boolean bool);

}
