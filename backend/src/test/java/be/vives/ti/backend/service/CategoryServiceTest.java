package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.response.CategoryResponse;
import be.vives.ti.backend.mapper.CategoryMapper;
import be.vives.ti.backend.model.Category;
import be.vives.ti.backend.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void findAll_returnsMappedResponses() {
        // arrange
        Category category = new Category("Vegetables");
        category.setId(1);
        // set minimal properties (if setters exist)
        CategoryResponse response = new CategoryResponse(1, "Vegetables");

        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(categoryMapper.toResponse(category)).thenReturn(response);

        // act
        List<CategoryResponse> result = categoryService.findAll();

        // assert
        assertThat(result).isNotNull()
                .hasSize(1)
                .containsExactly(response);

        verify(categoryRepository, times(1)).findAll();
        verify(categoryMapper, times(1)).toResponse(category);
    }

    @Test
    void findAll_returnsEmptyList_whenNoCategories() {
        // arrange
        when(categoryRepository.findAll()).thenReturn(Collections.emptyList());

        // act
        List<CategoryResponse> result = categoryService.findAll();

        // assert
        assertThat(result).isNotNull().isEmpty();
        verify(categoryRepository, times(1)).findAll();
        // mapper should not be called when there are no categories
        verifyNoInteractions(categoryMapper);
    }

    @Test
    void findAll_throwsNpe_whenRepositoryReturnsNull() {
        // arrange
        when(categoryRepository.findAll()).thenReturn(null);

        // act + assert
        assertThrows(NullPointerException.class, () -> categoryService.findAll());

        verify(categoryRepository, times(1)).findAll();
        // mapper should not be invoked because the service will fail before mapping
        verifyNoInteractions(categoryMapper);
    }
}
