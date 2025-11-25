package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Category;
import be.vives.ti.backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Integer> {
}
