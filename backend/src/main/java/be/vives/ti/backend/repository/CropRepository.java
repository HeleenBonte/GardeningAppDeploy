package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Crop;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CropRepository extends JpaRepository<Crop, Integer> {
    Page<Crop> findByNameContainingIgnoreCase(String name, Pageable pageable);
            //following methods needed? can implement in frontend
    Page<Crop> findByInHouse(Boolean bool, Pageable pageable);
    Page<Crop> findByInGarden(Boolean bool, Pageable pageable);
    Page<Crop> findByInGreenhouse(Boolean bool, Pageable pageable);
    Page<Crop> findByInPots(Boolean bool, Pageable pageable);

}
