package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Crop;
import be.vives.ti.backend.model.Recipe;
import be.vives.ti.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}
