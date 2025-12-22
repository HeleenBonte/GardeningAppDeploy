package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.request.CreateRecipeRequest;
import be.vives.ti.backend.dto.request.UpdateRecipeRequest;
import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.exceptions.GlobalExceptionHandler;
import be.vives.ti.backend.service.RecipeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.mockito.Mockito;
import be.vives.ti.backend.security.JwtUtil;
import org.springframework.security.core.userdetails.UserDetailsService;



@WebMvcTest(controllers = RecipeController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, RecipeControllerTest.TestConfig.class})
public class RecipeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // helper to access mock
    private RecipeService getRecipeService(){
        return TestConfig.recipeServiceMock;
    }

    @Test
    public void getAll_returnsOk() throws Exception {
        var recipe = new RecipeResponse(1, "cake", 1, "desc", "20m", "10m", "img", 1, 1, List.of(), List.of());
        Pageable pageable = PageRequest.of(0,20);
        when(getRecipeService().findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(recipe), pageable, 1));

        mockMvc.perform(get("/api/recipes").param("page","0").param("size","20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("cake"));
    }

    @Test
    public void getById_returnsOk() throws Exception {
        var recipe = new RecipeResponse(2, "soup", 1, "desc", "10m", "5m", "img", 1, 1, List.of(), List.of());
        when(getRecipeService().findById(2)).thenReturn(Optional.of(recipe));

        mockMvc.perform(get("/api/recipes/{id}", 2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("soup"));
    }

    @Test
    public void getById_notFound_returns404() throws Exception {
        when(getRecipeService().findById(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/recipes/{id}", 99))
                .andExpect(status().isNotFound());
                // removed content type assertion because controller returns 404 with no body
    }

    @Test
    public void getByCatId_returnsOk() throws Exception {
        var recipe = new RecipeResponse(3, "salad", 1, "desc", "5m", "10m", "img", 1, 2, List.of(), List.of());
        Pageable pageable = PageRequest.of(0,20);
        when(getRecipeService().findByCatId(eq(2), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(recipe), pageable, 1));

        mockMvc.perform(get("/api/recipes/category/{catId}", 2).param("page","0").param("size","20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("salad"));
    }

    @Test
    public void getByCourseId_returnsOk() throws Exception {
        var recipe = new RecipeResponse(4, "steak", 1, "desc", "30m", "15m", "img", 2, 1, List.of(), List.of());
        Pageable pageable = PageRequest.of(0,20);
        // controller calls recipeService.findByCatId(...) for courseId as well (implementation quirk)
        when(getRecipeService().findByCatId(eq(2), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(recipe), pageable, 1));

        mockMvc.perform(get("/api/recipes/course/{courseId}", 2).param("page","0").param("size","20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("steak"));
    }

    @Test
    public void getByIngredientId_returnsOk() throws Exception {
        var recipe = new RecipeResponse(5, "pasta", 1, "desc", "15m", "10m", "img", 1, 1, List.of(), List.of());
        Pageable pageable = PageRequest.of(0,20);
        // controller also uses findByIngredientId for ingredient id
        when(getRecipeService().findByIngredientId(eq(7), any(Pageable.class))).thenReturn(new PageImpl<>(List.of(recipe), pageable, 1));

        mockMvc.perform(get("/api/recipes/ingredient/{ingrId}", 7).param("page","0").param("size","20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("pasta"));
    }

    @Test
    public void createRecipe_returnsCreated() throws Exception {
        // build a valid create request
        var qty = new CreateRecipeRequest.CreateQuantityRequest(1,1,new BigDecimal("1.0"));
        var step = new CreateRecipeRequest.CreateRecipeStepRequest(1, "mix");
        var req = new CreateRecipeRequest("pie", null, "yummy", "5m", "10m", "img", 1, 1, List.of(qty), List.of(step));

        var created = new RecipeResponse(10, "pie", null, "yummy", "5m", "10m", "img", 1, 1, List.of(), List.of());
        when(getRecipeService().create(any(CreateRecipeRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/recipes/10")))
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("pie"));
    }

    @Test
    public void createRecipe_invalid_returnsBadRequest() throws Exception {
        // name blank -> validation fails
        var qty = new CreateRecipeRequest.CreateQuantityRequest(1,1,new BigDecimal("1.0"));
        var step = new CreateRecipeRequest.CreateRecipeStepRequest(1, "mix");
        var req = new CreateRecipeRequest("", null, "yummy", "5m", "10m", "img", 1, 1, List.of(qty), List.of(step));

        mockMvc.perform(post("/api/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    public void updateRecipe_returnsOk() throws Exception {
        var updateReq = new UpdateRecipeRequest("newname","newdesc","1m","2m","img", null, null, null, null);
        var updated = new RecipeResponse(20, "newname", null, "newdesc", "1m", "2m", "img", 1, 1, List.of(), List.of());
        when(getRecipeService().update(eq(20), any(UpdateRecipeRequest.class))).thenReturn(Optional.of(updated));

        mockMvc.perform(put("/api/recipes/{id}", 20)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("newname"));
    }

    @Test
    public void updateRecipe_notFound_returns404() throws Exception {
        var updateReq = new UpdateRecipeRequest("newname","newdesc","1m","2m","img", null, null, null, null);
        when(getRecipeService().update(eq(999), any(UpdateRecipeRequest.class))).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/recipes/{id}", 999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteRecipe_returnsNoContent() throws Exception {
        when(getRecipeService().delete(3)).thenReturn(true);

        mockMvc.perform(delete("/api/recipes/{id}", 3))
                .andExpect(status().isNoContent());
    }

    @Test
    public void deleteRecipe_notFound_returns404() throws Exception {
        when(getRecipeService().delete(999)).thenReturn(false);

        mockMvc.perform(delete("/api/recipes/{id}", 999))
                .andExpect(status().isNotFound());
    }

    @TestConfiguration
    public static class TestConfig {
        // keep reference so tests can access and stub the mock
        static RecipeService recipeServiceMock = Mockito.mock(RecipeService.class);
        // mock JwtUtil and UserDetailsService to satisfy security beans that may be present
        static JwtUtil jwtUtilMock = Mockito.mock(JwtUtil.class);
        static UserDetailsService userDetailsServiceMock = Mockito.mock(UserDetailsService.class);

        @Bean
        public RecipeService recipeService(){
            return recipeServiceMock;
        }

        @Bean
        public JwtUtil jwtUtil(){
            return jwtUtilMock;
        }

        @Bean
        public UserDetailsService userDetailsService(){
            return userDetailsServiceMock;
        }
    }
}
