package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.response.CategoryResponse;
import be.vives.ti.backend.service.CategoryService;
import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.exceptions.GlobalExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Primary;
import org.springframework.test.annotation.DirtiesContext;

import java.util.List;

import org.mockito.Mockito;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CategoryController.class)
@Import({GlobalExceptionHandler.class, CategoryControllerTest.TestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoryService categoryService;

    @Test
    @DisplayName("GET /api/categories - when categories exist returns 200 and list")
    void getAllCategories_returnsList() throws Exception {
        // arrange
        CategoryResponse c1 = new CategoryResponse(1, "Fruits");
        CategoryResponse c2 = new CategoryResponse(2, "Vegetables");
        doReturn(List.of(c1, c2)).when(categoryService).findAll();

        // act & assert
        mockMvc.perform(get("/api/categories")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Fruits"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].name").value("Vegetables"));
    }

    @Test
    @DisplayName("GET /api/categories - when service throws -> returns 500")
    void getAllCategories_whenServiceThrows_returnsInternalServerError() throws Exception {
        // arrange
        // GlobalExceptionHandler maps IllegalStateException (and some others) to 500. Use that instead of RuntimeException so the controller advice handles it.
        doThrow(new IllegalStateException("boom")).when(categoryService).findAll();

        // act & assert
        mockMvc.perform(get("/api/categories")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @TestConfiguration
    public static class TestConfig {

        @Bean
        @Primary
        public CategoryService categoryService() {
            return Mockito.mock(CategoryService.class);
        }

        @Bean
        public JwtUtil jwtUtil() {
            return Mockito.mock(JwtUtil.class);
        }

        @Bean
        public UserDetailsService userDetailsService() {
            return Mockito.mock(UserDetailsService.class);
        }
    }
}
