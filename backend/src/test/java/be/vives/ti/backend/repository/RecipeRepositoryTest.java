package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Category;
import be.vives.ti.backend.model.Ingredient;
import be.vives.ti.backend.model.Recipe;
import be.vives.ti.backend.model.RecipeQuantity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import({be.vives.ti.backend.config.JpaConfig.class, be.vives.ti.backend.config.AuditorAwareImpl.class})  // Enable JPA Auditing and provide auditor
public class RecipeRepositoryTest {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByRecipeName_whenExists_shouldReturnRecipe() {
        Recipe recipe = new Recipe();
        recipe.setRecipeName("Test Recipe");
        entityManager.persist(recipe);
        entityManager.flush();

        Optional<Recipe> found = recipeRepository.findByRecipeName("Test Recipe");

        assertThat(found).isPresent();
        assertThat(found.get().getRecipeName()).isEqualTo("Test Recipe");
    }

    @Test
    void findByRecipeName_whenNotExists_shouldReturnEmpty() {
        Optional<Recipe> found = recipeRepository.findByRecipeName("Nonexistent Recipe");

        assertThat(found).isEmpty();
    }

    @Test
    void findByCategoryId_withPagination_shouldReturnPagedRecipes() {
        // Create and persist a real Category so the foreign key in recipes points to an existing row
        Category category = new Category();
        // optionally set a name or other fields if required by constraints
        entityManager.persistAndFlush(category);
        int categoryId = category.getId();

        for (int i = 0; i < 15; i++) {
            Recipe recipe = new Recipe();
            recipe.setRecipeName("Recipe " + i);
            recipe.setCategory(category); // use the persisted category
            entityManager.persist(recipe);
        }
        entityManager.flush();

        Page<Recipe> page1 = recipeRepository.findByCategory_Id(categoryId, PageRequest.of(0, 10));
        Page<Recipe> page2 = recipeRepository.findByCategory_Id(categoryId, PageRequest.of(1, 10));

        assertThat(page1.getContent().size()).isEqualTo(10);
        assertThat(page2.getContent().size()).isEqualTo(5);
    }

    @Test
    void findByCategoryId_whenNone_shouldReturnEmptyPage() {
        int categoryId = 99999; // unlikely to exist

        Page<Recipe> page = recipeRepository.findByCategory_Id(categoryId, PageRequest.of(0, 10));

        assertThat(page.getContent()).isEmpty();
        assertThat(page.getTotalElements()).isEqualTo(0);
    }

    @Test
    void findByIngredientID_whenExists_shouldReturnRecipes() {
        Ingredient ingredient = new Ingredient();
        Ingredient managedIngredient = entityManager.persist(ingredient);
        entityManager.flush();

        Recipe recipe = new Recipe();
        recipe.setRecipeName("Recipe with Ingredient");
        Recipe managedRecipe = entityManager.persist(recipe);

        RecipeQuantity quantity = new RecipeQuantity();
        quantity.setIngredient(managedIngredient);
        quantity.setRecipe(managedRecipe);
        managedRecipe.addQuantity(quantity);

        entityManager.persist(managedRecipe);
        entityManager.flush();

        var recipes = recipeRepository.findByIngredientID(managedIngredient.getId());

        assertThat(recipes).isNotEmpty();
    }

    @Test
    void findByIngredientID_whenNotExists_shouldReturnEmptyList() {
        int nonExistingIngredientId = 99999;

        var recipes = recipeRepository.findByIngredientID(nonExistingIngredientId);

        assertThat(recipes).isNotNull();
        assertThat(recipes).isEmpty();
    }

    @Test
    void findById_ExistingRecipe_ReturnsRecipe() {
        // Given
        Recipe recipe = new Recipe();
        recipe.setRecipeName("Test Recipe");
        Recipe saved = entityManager.persistAndFlush(recipe);

        // When
        Optional<Recipe> result = recipeRepository.findById(saved.getId());

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getRecipeName()).isEqualTo("Test Recipe");
    }

    @Test
    void findById_NonExistingRecipe_ReturnsEmpty() {
        // When
        Optional<Recipe> result = recipeRepository.findById(999);
        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void save_NewRecipe_PersistsRecipe() {
        // Given
        Recipe recipe = new Recipe();
        recipe.setRecipeName("New Recipe");

        // When
        Recipe saved = recipeRepository.save(recipe);

        // Then
        Optional<Recipe> found = recipeRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getRecipeName()).isEqualTo("New Recipe");
    }

    @Test
    void delete_ExistingRecipe_RemovesFromDatabase() {
        // Given
        Recipe recipe = new Recipe();
        recipe.setRecipeName("To Delete");
        Recipe saved = entityManager.persistAndFlush(recipe);
        Integer id = saved.getId();
        // When
        recipeRepository.deleteById(id);
        entityManager.flush();
        // Then
        Optional<Recipe> result = recipeRepository.findById(id);
        assertThat(result).isEmpty();
    }


    @Test
    void findByCourseId_withPagination_shouldReturnPagedRecipes() {
        be.vives.ti.backend.model.Course course = new be.vives.ti.backend.model.Course();
        entityManager.persistAndFlush(course);
        int courseId = course.getId();

        for (int i = 0; i < 3; i++) {
            Recipe recipe = new Recipe();
            recipe.setRecipeName("Course Recipe " + i);
            recipe.setCourse(course);
            entityManager.persist(recipe);
        }
        entityManager.flush();

        Page<Recipe> page1 = recipeRepository.findByCourse_Id(courseId, PageRequest.of(0, 2));
        Page<Recipe> page2 = recipeRepository.findByCourse_Id(courseId, PageRequest.of(1, 2));

        assertThat(page1.getContent().size()).isEqualTo(2);
        assertThat(page2.getContent().size()).isEqualTo(1);
    }

    @Test
    void findByCourseId_whenNone_shouldReturnEmptyPage() {
        int nonExistingCourseId = 99999;

        Page<Recipe> page = recipeRepository.findByCourse_Id(nonExistingCourseId, PageRequest.of(0, 10));

        assertThat(page.getContent()).isEmpty();
        assertThat(page.getTotalElements()).isEqualTo(0);
    }

}
