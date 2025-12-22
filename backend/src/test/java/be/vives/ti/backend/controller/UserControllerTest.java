// Controller tests: disable security auto-configuration for deterministic controller behavior
package be.vives.ti.backend.controller;


import be.vives.ti.backend.dto.request.CreateUserRequest;
import be.vives.ti.backend.dto.request.UpdateUserRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.dto.response.UserResponse;
import be.vives.ti.backend.exceptions.GlobalExceptionHandler;
import be.vives.ti.backend.exceptions.ResourceNotFoundException;
import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Month;
import java.util.List;

import org.mockito.Mockito;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.security.core.userdetails.UserDetailsService;


@WebMvcTest(controllers = UserController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, UserControllerTest.TestConfig.class})
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // simple stand-in record matching UserResponse
    public record SimpleUserResponse(Integer id, String userName, String userEmail, String role) {}

    @Test
    public void getUser_returnsOk() throws Exception {
        var user = new SimpleUserResponse(1, "john", "john@example.com", "USER");
        when(getUserService().findById(1)).thenReturn(new UserResponse(user.id(), user.userName(), user.userEmail(), user.role()));

        mockMvc.perform(get("/api/users/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.userName").value("john"));
    }

    // helper to access the mock from the test config (keeps test code readable)
    private UserService getUserService() {
        return TestConfig.userServiceMock;
    }

    @Test
    public void getAllUsers_returnsOk() throws Exception {
        var user = new UserResponse(2, "jane", "jane@example.com", "ADMIN");
        Pageable pageable = PageRequest.of(0, 20);
        when(getUserService().findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(user), pageable, 1));

        mockMvc.perform(get("/api/users").param("page", "0").param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].userName").value("jane"));
    }

    @Test
    public void createUser_returnsCreated() throws Exception {
        var request = new CreateUserRequest("newuser", "new@example.com", "password123");
        var created = new UserResponse(5, "newuser", "new@example.com", "USER");
        when(getUserService().create(any(CreateUserRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/api/users/5")))
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.userName").value("newuser"));
    }

    @Test
    public void getFavoriteCrops_returnsOk() throws Exception {
        var crop = new CropResponse(1, "tomato", Month.MARCH, Month.MAY, Month.APRIL, Month.JUNE, Month.JULY, Month.SEPTEMBER, true, false, true, false, "desc", "tips", "img");
        when(getUserService().findFavoriteCrops(1)).thenReturn(List.of(crop));

        mockMvc.perform(get("/api/users/{id}/favorite-crops", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("tomato"));
    }

    @Test
    public void addFavoriteCrop_returnsOk() throws Exception {
        doNothing().when(getUserService()).addFavoriteCrop(1, 2);

        mockMvc.perform(post("/api/users/{userId}/favorite-crops/{cropId}", 1, 2))
                .andExpect(status().isOk());
    }

    @Test
    public void removeFavoriteCrop_returnsNoContent() throws Exception {
        doNothing().when(getUserService()).removeFavoriteCrop(1, 2);

        mockMvc.perform(delete("/api/users/{userId}/favorite-crops/{cropId}", 1, 2))
                .andExpect(status().isNoContent());
    }

    @Test
    public void getFavoriteRecipes_returnsOk() throws Exception {
        var recipe = new RecipeResponse(1, "cake", 1, "desc", "20m", "10m", "img", 1, 1, List.of(), List.of());
        when(getUserService().getFavoriteRecipes(1)).thenReturn(List.of(recipe));

        mockMvc.perform(get("/api/users/{id}/favorite-recipes", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    public void addFavoriteRecipe_returnsOk() throws Exception {
        doNothing().when(getUserService()).addFavoriteRecipe(1, 2);

        mockMvc.perform(post("/api/users/{userId}/favorite-recipes/{recipeId}", 1, 2))
                .andExpect(status().isOk());
    }

    @Test
    public void removeFavoriteRecipe_returnsNoContent() throws Exception {
        doNothing().when(getUserService()).removeFavoriteRecipe(1, 2);

        mockMvc.perform(delete("/api/users/{userId}/favorite-recipes/{recipeId}", 1, 2))
                .andExpect(status().isNoContent());
    }

    @Test
    public void updateUser_returnsOk() throws Exception {
        var request = new UpdateUserRequest("newname", "new@example.com");
        var updated = new UserResponse(3, "newname", "new@example.com", "USER");
        // use matchers so the deserialized request object matches the stub
        when(getUserService().update(org.mockito.ArgumentMatchers.eq(3), any(UpdateUserRequest.class))).thenReturn(updated);
        // stub jwt generation (controller now returns AuthResponse with token)
        when(TestConfig.jwtUtilMock.generateToken(updated.getUserEmail(), "USER")).thenReturn("newtoken");

        mockMvc.perform(put("/api/users/{id}", 3)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                // controller now returns AuthResponse with fields: id, token, email, name, role
                .andExpect(jsonPath("$.name").value("newname"))
                .andExpect(jsonPath("$.token").value("newtoken"))
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.email").value("new@example.com"));
    }

    @Test
    public void deleteUser_returnsNoContent() throws Exception {
        doNothing().when(getUserService()).delete(4);

        mockMvc.perform(delete("/api/users/{id}", 4))
                .andExpect(status().isNoContent());
    }

    @Test
    public void getUserById_notFound_returns404() throws Exception {
        when(getUserService().findById(99)).thenThrow(new ResourceNotFoundException("User", 99));

        mockMvc.perform(get("/api/users/{id}", 99))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value(containsString("User with ID 99 not found")));
    }

    @Test
    public void createUser_duplicateEmail_returnsServerError() throws Exception {
        var request = new CreateUserRequest("dupuser", "dup@example.com", "password123");
        when(getUserService().create(any(CreateUserRequest.class))).thenThrow(new IllegalArgumentException("Email already in use"));

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value(containsString("An unexpected error occurred")));
    }


    // Test configuration that registers Mockito mocks as Spring beans (avoids deprecated @MockBean)
    @TestConfiguration
    public static class TestConfig {

        // keep references so tests can access and stub the mocks
        static UserService userServiceMock = Mockito.mock(UserService.class);
        static JwtUtil jwtUtilMock = Mockito.mock(JwtUtil.class);
        static UserDetailsService userDetailsServiceMock = Mockito.mock(UserDetailsService.class);

        @Bean
        public UserService userService() {
            return userServiceMock;
        }

        @Bean
        public JwtUtil jwtUtil() {
            return jwtUtilMock;
        }

        @Bean
        public UserDetailsService userDetailsService() {
            return userDetailsServiceMock;
        }
    }
}
