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
    Optional<User> findByUserName(String userName);
    @Query("SELECT u FROM User u JOIN FETCH u.favoriteCrops WHERE u.id = :id")
    List<Crop> findByIdWithFavoriteCrops(@Param("id") int id);
    @Query("SELECT u FROM User u JOIN FETCH u.favoriteRecipes WHERE u.id = :id")
    List<Recipe> findByIdWithFavoriteRecipes(@Param("id") int id);
    Optional<User> findByEmail(String email);
}
