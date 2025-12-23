package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.request.CreateRecipeRequest;
import be.vives.ti.backend.dto.request.UpdateRecipeRequest;
import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.mapper.RecipeMapper;
import be.vives.ti.backend.model.Category;
import be.vives.ti.backend.model.Course;
import be.vives.ti.backend.model.Recipe;
import be.vives.ti.backend.repository.CategoryRepository;
import be.vives.ti.backend.repository.CourseRepository;
import be.vives.ti.backend.repository.IngredientMeasurementRepository;
import be.vives.ti.backend.repository.IngredientRepository;
import be.vives.ti.backend.repository.RecipeRepository;
import be.vives.ti.backend.repository.UserRepository;
import be.vives.ti.backend.exceptions.RecipeException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
public class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private RecipeMapper recipeMapper;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private IngredientMeasurementRepository measurementRepository;

    @InjectMocks
    private RecipeService recipeService;

    @Test
    void findAll_returnsMappedResponses() {
        // Arrange
        Recipe r1 = new Recipe("R1", null, "desc1", "5m", "10m", null, new Course("C1"), new Category("Cat1"));
        Recipe r2 = new Recipe("R2", null, "desc2", "10m", "20m", null, new Course("C2"), new Category("Cat2"));
        Pageable pageable = PageRequest.of(0, 10);
        Page<Recipe> page = new PageImpl<>(List.of(r1, r2), pageable, 2);

        RecipeResponse resp1 = new RecipeResponse(1, "R1", null, "desc1", "5m", "10m", null, null, null, List.of(), List.of());
        RecipeResponse resp2 = new RecipeResponse(2, "R2", null, "desc2", "10m", "20m", null, null, null, List.of(), List.of());

        when(recipeRepository.findAll(pageable)).thenReturn(page);
        // Use argument-based Answer to avoid instance-equality matching issues
        when(recipeMapper.toResponse(any(Recipe.class))).thenAnswer(invocation -> {
            Recipe r = invocation.getArgument(0);
            if ("R1".equals(r.getRecipeName())) return resp1;
            if ("R2".equals(r.getRecipeName())) return resp2;
            return null;
        });

        // Act
        Page<RecipeResponse> result = recipeService.findAll(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertThat(result.getContent()).containsExactly(resp1, resp2);
        verify(recipeRepository, times(1)).findAll(pageable);
        verify(recipeMapper, times(2)).toResponse(any(Recipe.class));
    }

    @Test
    void findByCatId_returnsMappedResponses() {
        // Arrange
        int catId = 5;
        Recipe r = new Recipe("ByCat", null, "desc", "2m", "5m", null, new Course("C"), new Category("Cat"));
        Pageable pageable = PageRequest.of(0, 5);
        Page<Recipe> page = new PageImpl<>(List.of(r), pageable, 1);
        RecipeResponse resp = new RecipeResponse(3, "ByCat", null, "desc", "2m", "5m", null, null, catId, List.of(), List.of());

        when(recipeRepository.findByCategory_Id(catId, pageable)).thenReturn(page);
        when(recipeMapper.toResponse(any(Recipe.class))).thenReturn(resp);

        // Act
        Page<RecipeResponse> result = recipeService.findByCatId(catId, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertThat(result.getContent()).containsExactly(resp);
        verify(recipeRepository, times(1)).findByCategory_Id(catId, pageable);
        verify(recipeMapper, times(1)).toResponse(any(Recipe.class));
    }

    @Test
    void findByIngredientId_returnsMappedResponses() {
        // Arrange
        int ingredientId = 7;
        Recipe r = new Recipe("ByIng", null, "descIng", "3m", "6m", null, new Course("C"), new Category("Cat"));
        Pageable pageable = PageRequest.of(0, 10);
        Page<Recipe> page = new PageImpl<>(List.of(r), pageable, 1);
        RecipeResponse resp = new RecipeResponse(5, "ByIng", null, "descIng", "3m", "6m", null, null, null, List.of(), List.of());

        when(recipeRepository.findByIngredientID(ingredientId, pageable)).thenReturn(page);
        when(recipeMapper.toResponse(any(Recipe.class))).thenReturn(resp);

        // Act
        Page<RecipeResponse> result = recipeService.findByIngredientId(ingredientId, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertThat(result.getContent()).containsExactly(resp);
        verify(recipeRepository, times(1)).findByIngredientID(ingredientId, pageable);
        verify(recipeMapper, times(1)).toResponse(any(Recipe.class));
    }

    @Test
    void create_success_createsAndReturnsResponse() {
        // Arrange
        CreateRecipeRequest request = new CreateRecipeRequest(
                "Pancake",
                null,
                "Tasty",
                "5m",
                "10m",
                "http://img",
                1,
                2,
                List.of(),
                List.of()
        );

        Recipe entity = new Recipe();
        Recipe saved = new Recipe();

        RecipeResponse expectedResponse = new RecipeResponse(11, "Pancake", null, "Tasty", "5m", "10m", "http://img", 1, 2, List.of(), List.of());

        when(recipeRepository.findByRecipeName("Pancake")).thenReturn(Optional.empty());
        when(recipeMapper.toEntity(request)).thenReturn(entity);
        when(courseRepository.findById(1)).thenReturn(Optional.of(new Course("Breakfast")));
        when(categoryRepository.findById(2)).thenReturn(Optional.of(new Category("Dessert")));
        when(recipeRepository.save(entity)).thenReturn(saved);
        when(recipeMapper.toResponse(saved)).thenReturn(expectedResponse);

        // Act
        RecipeResponse response = recipeService.create(request);

        // Assert
        assertNotNull(response);
        assertEquals(expectedResponse, response);
        verify(recipeRepository).findByRecipeName("Pancake");
        verify(recipeMapper).toEntity(request);
        verify(recipeRepository).save(entity);
        verify(recipeMapper).toResponse(saved);
    }

    @Test
    void create_whenNameExists_throwsRecipeException() {
        // Arrange
        CreateRecipeRequest request = new CreateRecipeRequest(
                "Dup",
                null,
                "desc",
                "5m",
                "5m",
                "img",
                1,
                1,
                List.of(),
                List.of()
        );
        when(recipeRepository.findByRecipeName("Dup")).thenReturn(Optional.of(new Recipe()));

        // Act & Assert
        assertThrows(RecipeException.class, () -> recipeService.create(request));
        verify(recipeRepository).findByRecipeName("Dup");
        verifyNoMoreInteractions(recipeRepository);
    }

    @Test
    void findByCourseId_returnsMappedResponses() {
        // Arrange
        int courseId = 9;
        Recipe r = new Recipe("ByCourse", null, "descCourse", "4m", "8m", null, new Course("Dinner"), new Category("Cat"));
        Pageable pageable = PageRequest.of(0, 5);
        Page<Recipe> page = new PageImpl<>(List.of(r), pageable, 1);
        RecipeResponse resp = new RecipeResponse(6, "ByCourse", null, "descCourse", "4m", "8m", null, courseId, null, List.of(), List.of());

        when(recipeRepository.findByCourse_Id(courseId, pageable)).thenReturn(page);
        when(recipeMapper.toResponse(any(Recipe.class))).thenReturn(resp);

        // Act
        Page<RecipeResponse> result = recipeService.findByCourseId(courseId, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertThat(result.getContent()).containsExactly(resp);
        verify(recipeRepository, times(1)).findByCourse_Id(courseId, pageable);
        verify(recipeMapper, times(1)).toResponse(any(Recipe.class));
    }

    @Test
    void findByCourseId_noResults_returnsEmptyPage() {
        // Arrange
        int courseId = 12345; // non-existing course
        Pageable pageable = PageRequest.of(0, 10);
        Page<Recipe> emptyPage = new PageImpl<>(List.of(), pageable, 0);

        when(recipeRepository.findByCourse_Id(courseId, pageable)).thenReturn(emptyPage);

        // Act
        Page<RecipeResponse> result = recipeService.findByCourseId(courseId, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertThat(result.getContent()).isEmpty();
        verify(recipeRepository, times(1)).findByCourse_Id(courseId, pageable);
        verify(recipeMapper, never()).toResponse(any(Recipe.class));
    }

    @Test
    void update_found_updatesAndReturnsResponse() {
        // Arrange
        int id = 7;
        Recipe existing = new Recipe("Old", null, "old", "1m", "1m", null, new Course("C"), new Category("Cat"));
        UpdateRecipeRequest updateReq = new UpdateRecipeRequest("New", "newdesc", "2m", "3m", "img", null, null, List.of(), List.of());
        Recipe saved = new Recipe();
        RecipeResponse mapped = new RecipeResponse(7, "New", null, "newdesc", "2m", "3m", "img", null, null, List.of(), List.of());

        when(recipeRepository.findById(id)).thenReturn(Optional.of(existing));
        when(recipeRepository.save(existing)).thenReturn(saved);
        when(recipeMapper.toResponse(saved)).thenReturn(mapped);

        // Act
        Optional<RecipeResponse> result = recipeService.update(id, updateReq);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(mapped, result.get());
        verify(recipeRepository).findById(id);
        verify(recipeRepository).save(existing);
        verify(recipeMapper).toResponse(saved);
    }

    @Test
    void update_notFound_returnsEmpty() {
        // Arrange
        when(recipeRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Optional<RecipeResponse> result = recipeService.update(999, null);

        // Assert
        assertTrue(result.isEmpty());
        verify(recipeRepository).findById(999);
        verifyNoMoreInteractions(recipeRepository);
    }

    @Test
    void delete_existing_returnsTrue_elseFalse() {
        // Arrange
        when(recipeRepository.existsById(1)).thenReturn(true);
        when(recipeRepository.existsById(2)).thenReturn(false);

        // Act & Assert
        assertTrue(recipeService.delete(1));
        verify(recipeRepository).deleteById(1);

        assertFalse(recipeService.delete(2));
        verify(recipeRepository, times(1)).existsById(1);
        verify(recipeRepository, times(1)).existsById(2);
    }

    @Test
    void findById_found_and_notFound() {
        // Arrange
        Recipe r = new Recipe("X", null, "d", "1m", "1m", null, new Course("C"), new Category("Cat"));
        RecipeResponse resp = new RecipeResponse(42, "X", null, "d", "1m", "1m", null, null, null, List.of(), List.of());
        when(recipeRepository.findById(42)).thenReturn(Optional.of(r));
        when(recipeMapper.toResponse(r)).thenReturn(resp);

        // Act & Assert
        Optional<RecipeResponse> got = recipeService.findById(42);
        assertTrue(got.isPresent());
        assertEquals(resp, got.get());

        when(recipeRepository.findById(99)).thenReturn(Optional.empty());
        assertTrue(recipeService.findById(99).isEmpty());
    }
}
