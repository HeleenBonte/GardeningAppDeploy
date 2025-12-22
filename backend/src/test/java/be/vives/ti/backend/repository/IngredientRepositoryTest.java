package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Ingredient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;


import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
@DataJpaTest
@Import({be.vives.ti.backend.config.JpaConfig.class, be.vives.ti.backend.config.AuditorAwareImpl.class})  // Enable JPA Auditing and provide auditor
public class IngredientRepositoryTest {

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByNameIgnoreCase_whenExists_shouldReturnIngredient() {
        Ingredient ingredient = new Ingredient("Tomato");
        entityManager.persistAndFlush(ingredient);

        Optional<Ingredient> found = ingredientRepository.findByNameIgnoreCase("tomato");

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Tomato");
    }

    @Test
    void findByNameIgnoreCase_whenNotExists_shouldReturnEmpty() {
        Optional<Ingredient> found = ingredientRepository.findByNameIgnoreCase("NonExistentIngredient");

        assertThat(found).isEmpty();
    }

    @Test
    void findById_ExistingIngredient_ReturnsIngredient() {
        // Given
        Ingredient ingredient = new Ingredient("Cheese");
        Ingredient saved = entityManager.persistAndFlush(ingredient);

        // When
        Optional<Ingredient> result = ingredientRepository.findById(saved.getId());

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Cheese");
    }

    @Test
    void findById_NonExistingIngredient_ReturnsEmpty() {
        // When
        Optional<Ingredient> result = ingredientRepository.findById(999);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void save_NewIngredient_PersistsIngredient() {
        // Given
        Ingredient ingredient = new Ingredient("Basil");

        // When
        Ingredient saved = ingredientRepository.save(ingredient);

        // Then
        Optional<Ingredient> found = ingredientRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Basil");
    }

    @Test
    void delete_ExistingIngredient_RemovesFromDatabase() {
        // Given
        Ingredient ingredient = new Ingredient("Oregano");
        Ingredient saved = entityManager.persistAndFlush(ingredient);
        Integer id = saved.getId();

        // When
        ingredientRepository.deleteById(id);
        entityManager.flush();

        // Then
        Optional<Ingredient> result = ingredientRepository.findById(id);
        assertThat(result).isEmpty();
    }
}
