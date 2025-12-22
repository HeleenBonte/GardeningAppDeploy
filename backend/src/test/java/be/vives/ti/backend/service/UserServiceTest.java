package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.request.CreateUserRequest;
import be.vives.ti.backend.dto.request.UpdateUserRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.dto.response.UserResponse;
import be.vives.ti.backend.exceptions.ResourceNotFoundException;
import be.vives.ti.backend.mapper.CropMapper;
import be.vives.ti.backend.mapper.RecipeMapper;
import be.vives.ti.backend.mapper.UserMapper;
import be.vives.ti.backend.model.Crop;
import be.vives.ti.backend.model.Recipe;
import be.vives.ti.backend.model.Role;
import be.vives.ti.backend.model.User;
import be.vives.ti.backend.repository.CropRepository;
import be.vives.ti.backend.repository.RecipeRepository;
import be.vives.ti.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
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
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private CropMapper cropMapper;

    @Mock
    private CropRepository cropRepository;

    @Mock
    private RecipeMapper recipeMapper;

    @Mock
    private RecipeRepository recipeRepository;

    @InjectMocks
    private UserService userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = new User("Alice", "alice@example.com", Role.USER);
        user1.setId(1);
        user2 = new User("Bob", "bob@example.com", Role.USER);
        user2.setId(2);
    }

    @Test
    void findAll_returnsMappedResponses() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(List.of(user1, user2));
        when(userRepository.findAll(pageable)).thenReturn(page);

        when(userMapper.toResponse(user1)).thenReturn(new UserResponse(1, "Alice", "alice@example.com", "USER"));
        when(userMapper.toResponse(user2)).thenReturn(new UserResponse(2, "Bob", "bob@example.com", "USER"));

        Page<UserResponse> result = userService.findAll(pageable);

        assertThat(result).hasSize(2);
        assertThat(result.getContent()).extracting(UserResponse::getUserName).containsExactly("Alice", "Bob");
        verify(userRepository).findAll(pageable);
    }

    @Test
    void findAll_emptyPage_returnsEmpty() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(List.of());
        when(userRepository.findAll(pageable)).thenReturn(page);

        Page<UserResponse> result = userService.findAll(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).isEmpty();
        verify(userRepository).findAll(pageable);
    }

    @Test
    void findById_whenExists_returnsMappedResponse() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(userMapper.toResponse(user1)).thenReturn(new UserResponse(1, "Alice", "alice@example.com", "USER"));

        UserResponse resp = userService.findById(1);

        assertThat(resp).isNotNull();
        assertThat(resp.getUserEmail()).isEqualTo("alice@example.com");
    }

    @Test
    void findById_whenNotFound_throws() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.findById(99)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void create_whenEmailUnused_createsUser() {
        CreateUserRequest req = new CreateUserRequest("Charlie", "charlie@example.com", "password123");
        when(userRepository.findByEmail(req.email())).thenReturn(Optional.empty());

        User toSave = new User("Charlie", "charlie@example.com", Role.USER);
        when(userMapper.toEntity(req)).thenReturn(toSave);

        User saved = new User("Charlie", "charlie@example.com", Role.USER);
        saved.setId(5);
        when(userRepository.save(toSave)).thenReturn(saved);
        when(userMapper.toResponse(saved)).thenReturn(new UserResponse(5, "Charlie", "charlie@example.com", "USER"));

        UserResponse result = userService.create(req);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(5);
        verify(userRepository).save(toSave);
    }

    @Test
    void create_whenEmailUsed_throws() {
        CreateUserRequest req = new CreateUserRequest("Dup", "dup@example.com", "password123");
        when(userRepository.findByEmail(req.email())).thenReturn(Optional.of(user1));

        assertThatThrownBy(() -> userService.create(req)).isInstanceOf(IllegalArgumentException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void create_whenSaveThrows_propagatesException() {
        CreateUserRequest req = new CreateUserRequest("Eve", "eve@example.com", "pw");
        when(userRepository.findByEmail(req.email())).thenReturn(Optional.empty());
        User toSave = new User("Eve", "eve@example.com", Role.USER);
        when(userMapper.toEntity(req)).thenReturn(toSave);
        when(userRepository.save(toSave)).thenThrow(new RuntimeException("db down"));

        assertThatThrownBy(() -> userService.create(req)).isInstanceOf(RuntimeException.class);
    }

    @Test
    void findFavoriteCrops_whenExists_returnsMappedCrops() {
        Crop crop = new Crop("Tomato");
        crop.setId(10);
        user1.addFavoriteCrop(crop);
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(cropMapper.toResponse(crop)).thenReturn(new CropResponse(10, "Tomato", null, null, null, null, null, null, null, null, null, null, null, null, null));

        var list = userService.findFavoriteCrops(1);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).name()).isEqualTo("Tomato");
    }

    @Test
    void findFavoriteCrops_userNotFound_throws() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.findFavoriteCrops(99)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addFavoriteCrop_success() {
        Crop crop = new Crop("Lettuce");
        crop.setId(11);
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(cropRepository.findById(11)).thenReturn(Optional.of(crop));

        userService.addFavoriteCrop(1, 11);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getFavoriteCrops()).extracting(Crop::getName).contains("Lettuce");
    }

    @Test
    void addFavoriteCrop_userNotFound_throws() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.addFavoriteCrop(99, 11)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addFavoriteCrop_cropNotFound_throws() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(cropRepository.findById(999)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.addFavoriteCrop(1, 999)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removeFavoriteCrop_success() {
        Crop crop = new Crop("Pea");
        crop.setId(12);
        user1.addFavoriteCrop(crop);
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(cropRepository.findById(12)).thenReturn(Optional.of(crop));

        userService.removeFavoriteCrop(1, 12);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getFavoriteCrops()).doesNotContain(crop);
    }

    @Test
    void removeFavoriteCrop_cropNotFound_throws() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(cropRepository.findById(9999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.removeFavoriteCrop(1, 9999)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getFavoriteRecipes_returnsMapped() {
        Recipe r = new Recipe();
        r.setId(20);
        r.setRecipeName("R1");
        user1.addFavoriteRecipe(r);
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(recipeMapper.toResponse(r)).thenReturn(new RecipeResponse(20, "R1", null, "desc", null, null, null, null, null, List.of(), List.of()));

        var list = userService.getFavoriteRecipes(1);
        assertThat(list).hasSize(1);
        assertThat(list.get(0).name()).isEqualTo("R1");
    }

    @Test
    void getFavoriteRecipes_userNotFound_throws() {
        when(userRepository.findById(404)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.getFavoriteRecipes(404)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addFavoriteRecipe_success() {
        Recipe r = new Recipe();
        r.setId(21);
        r.setRecipeName("R2");
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(recipeRepository.findById(21)).thenReturn(Optional.of(r));

        userService.addFavoriteRecipe(1, 21);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getFavoriteRecipes()).extracting(Recipe::getRecipeName).contains("R2");
    }

    @Test
    void addFavoriteRecipe_userNotFound_throws() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.addFavoriteRecipe(99, 21)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void addFavoriteRecipe_recipeNotFound_throws() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(recipeRepository.findById(9999)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.addFavoriteRecipe(1, 9999)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void removeFavoriteRecipe_success() {
        Recipe r = new Recipe();
        r.setId(30);
        r.setRecipeName("R3");
        user1.addFavoriteRecipe(r);
        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(recipeRepository.findById(30)).thenReturn(Optional.of(r));

        userService.removeFavoriteRecipe(1, 30);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getFavoriteRecipes()).doesNotContain(r);
    }

    @Test
    void update_success() {
        UpdateUserRequest req = new UpdateUserRequest("newname", "new@example.com");
        when(userRepository.findById(3)).thenReturn(Optional.of(user1));
        // userMapper.updateEntity will be invoked - we let it do nothing (it's a mock)
        User updated = new User("newname", "new@example.com", Role.USER);
        updated.setId(3);
        when(userRepository.save(any(User.class))).thenReturn(updated);
        when(userMapper.toResponse(updated)).thenReturn(new UserResponse(3, "newname", "new@example.com", "USER"));

        UserResponse resp = userService.update(3, req);

        assertThat(resp.getUserName()).isEqualTo("newname");
    }

    @Test
    void update_notFound_throws() {
        UpdateUserRequest req = new UpdateUserRequest("x","x@x.com");
        when(userRepository.findById(404)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.update(404, req)).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void delete_success() {
        when(userRepository.findById(2)).thenReturn(Optional.of(user2));
        userService.delete(2);
        verify(userRepository).delete(user2);
    }

    @Test
    void delete_notFound_throws() {
        when(userRepository.findById(999)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> userService.delete(999)).isInstanceOf(ResourceNotFoundException.class);
    }
}
