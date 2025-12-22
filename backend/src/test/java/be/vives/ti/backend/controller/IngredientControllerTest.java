package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.request.CreateIngredientRequest;
import be.vives.ti.backend.dto.response.IngredientResponse;
import be.vives.ti.backend.service.IngredientService;
import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.exceptions.GlobalExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = IngredientController.class)
@Import({GlobalExceptionHandler.class, IngredientControllerTest.TestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class IngredientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IngredientService ingredientService;

    @Test
    @DisplayName("GET /api/ingredients - when ingredients exist returns 200 and page")
    void getAllIngredients_returnsPage() throws Exception {
        // arrange
        IngredientResponse i1 = new IngredientResponse(1, "Sugar");
        IngredientResponse i2 = new IngredientResponse(2, "Salt");
        doReturn(new PageImpl<>(List.of(i1, i2))).when(ingredientService).findAll(Mockito.any(Pageable.class));

        // act & assert
        mockMvc.perform(get("/api/ingredients").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Sugar"))
                .andExpect(jsonPath("$.content[1].id").value(2))
                .andExpect(jsonPath("$.content[1].name").value("Salt"));
    }

    @Test
    @DisplayName("GET /api/ingredients - when service throws -> returns 500")
    void getAllIngredients_whenServiceThrows_returnsInternalServerError() throws Exception {
        doThrow(new IllegalStateException("boom")).when(ingredientService).findAll(Mockito.any(Pageable.class));

        mockMvc.perform(get("/api/ingredients").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("POST /api/ingredients - when valid request returns 201 and created resource")
    void createIngredient_returnsCreated() throws Exception {
        IngredientResponse created = new IngredientResponse(10, "Pepper");
        doReturn(created).when(ingredientService).create(Mockito.any(CreateIngredientRequest.class));

        String json = "{\"name\":\"Pepper\",\"cropId\":null}";

        mockMvc.perform(post("/api/ingredients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Pepper"));
    }

    @Test
    @DisplayName("POST /api/ingredients - when invalid request returns 400")
    void createIngredient_invalid_returnsBadRequest() throws Exception {
        // missing name -> NotBlank violation
        String json = "{\"name\":\"\",\"cropId\":null}";

        mockMvc.perform(post("/api/ingredients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/ingredients/{id} - when delete succeeds returns 200")
    void deleteIngredient_returnsOk() throws Exception {
        doReturn(true).when(ingredientService).delete(1);

        mockMvc.perform(delete("/api/ingredients/1"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/ingredients/{id} - when not found returns 404")
    void deleteIngredient_notFound_returnsNotFound() throws Exception {
        doReturn(false).when(ingredientService).delete(999);

        mockMvc.perform(delete("/api/ingredients/999"))
                .andExpect(status().isNotFound());
    }

    @TestConfiguration
    public static class TestConfig {

        @Bean
        @Primary
        public IngredientService ingredientService() {
            return Mockito.mock(IngredientService.class);
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
