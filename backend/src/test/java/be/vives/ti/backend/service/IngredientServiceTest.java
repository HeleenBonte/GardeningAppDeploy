package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.request.CreateIngredientRequest;
import be.vives.ti.backend.dto.response.IngredientResponse;
import be.vives.ti.backend.exceptions.IngredientException;
import be.vives.ti.backend.mapper.IngredientMapper;
import be.vives.ti.backend.model.Ingredient;
import be.vives.ti.backend.model.Recipe;
import be.vives.ti.backend.repository.IngredientRepository;
import be.vives.ti.backend.repository.RecipeRepository;
import org.junit.jupiter.api.BeforeEach;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class IngredientServiceTest {

    @Mock
    private IngredientRepository ingredientRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private IngredientMapper ingredientMapper;

    @InjectMocks
    private IngredientService ingredientService;

    private Pageable pageable;

    @BeforeEach
    void setUp() {
        pageable = PageRequest.of(0, 10);
    }

    @Test
    void findAll_returnsPagedResponses() {
        // arrange
        Ingredient i1 = mock(Ingredient.class);
        Ingredient i2 = mock(Ingredient.class);

        IngredientResponse r1 = new IngredientResponse(1, "Salt", null);
        IngredientResponse r2 = new IngredientResponse(2, "Sugar", null);

        Page<Ingredient> page = new PageImpl<>(List.of(i1, i2));

        when(ingredientRepository.findAll(pageable)).thenReturn(page);
        when(ingredientMapper.toResponse(i1)).thenReturn(r1);
        when(ingredientMapper.toResponse(i2)).thenReturn(r2);

        // act
        Page<IngredientResponse> result = ingredientService.findAll(pageable);

        // assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).containsExactly(r1, r2);

        verify(ingredientRepository, times(1)).findAll(pageable);
        verify(ingredientMapper, times(1)).toResponse(i1);
        verify(ingredientMapper, times(1)).toResponse(i2);
    }

    @Test
    void create_whenNameAlreadyExists_throwsIngredientException() {
        // arrange
        CreateIngredientRequest request = new CreateIngredientRequest("salt", null);
        when(ingredientRepository.findByNameIgnoreCase("salt")).thenReturn(Optional.of(new Ingredient()));

        // act / assert
        assertThatThrownBy(() -> ingredientService.create(request))
                .isInstanceOf(IngredientException.class)
                .hasMessageContaining("Ingredient name already in use");

        verify(ingredientRepository, times(1)).findByNameIgnoreCase("salt");
        verify(ingredientRepository, never()).save(any());
    }

    @Test
    void create_whenValid_createsAndReturnsResponse() {
        // arrange
        CreateIngredientRequest request = new CreateIngredientRequest("Pepper", null);
        Ingredient toSave = new Ingredient();
        Ingredient saved = new Ingredient();
        IngredientResponse response = new IngredientResponse(5, "Pepper", null);

        when(ingredientRepository.findByNameIgnoreCase("Pepper")).thenReturn(Optional.empty());
        when(ingredientMapper.toEntity(request)).thenReturn(toSave);
        when(ingredientRepository.save(toSave)).thenReturn(saved);
        when(ingredientMapper.toResponse(saved)).thenReturn(response);

        // act
        IngredientResponse result = ingredientService.create(request);

        // assert
        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(5);
        assertThat(result.name()).isEqualTo("Pepper");

        verify(ingredientRepository).findByNameIgnoreCase("Pepper");
        verify(ingredientMapper).toEntity(request);
        verify(ingredientRepository).save(toSave);
        verify(ingredientMapper).toResponse(saved);
    }

    @Test
    void delete_whenNotExists_returnsFalse() {
        // arrange
        when(ingredientRepository.existsById(10)).thenReturn(false);

        // act
        boolean result = ingredientService.delete(10);

        // assert
        assertThat(result).isFalse();
        verify(ingredientRepository).existsById(10);
        verify(recipeRepository, never()).findByIngredientID(anyInt());
    }

    @Test
    void delete_whenUsedInRecipes_returnsFalse() {
        // arrange
        when(ingredientRepository.existsById(3)).thenReturn(true);
        when(recipeRepository.findByIngredientID(3)).thenReturn(List.of(mock(Recipe.class))); // non-empty

        // act
        boolean result = ingredientService.delete(3);

        // assert
        assertThat(result).isFalse();
        verify(ingredientRepository).existsById(3);
        verify(recipeRepository).findByIngredientID(3);
        verify(ingredientRepository, never()).deleteById(anyInt());
    }

    @Test
    void delete_whenExistsAndNotUsed_deletesAndReturnsTrue() {
        // arrange
        when(ingredientRepository.existsById(7)).thenReturn(true);
        when(recipeRepository.findByIngredientID(7)).thenReturn(List.of());

        // act
        boolean result = ingredientService.delete(7);

        // assert
        assertThat(result).isTrue();
        verify(ingredientRepository).existsById(7);
        verify(recipeRepository).findByIngredientID(7);
        verify(ingredientRepository).deleteById(7);
    }
}
