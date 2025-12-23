package be.vives.ti.backend.service;


import be.vives.ti.backend.dto.request.CreateUserRequest;
import be.vives.ti.backend.dto.request.UpdateUserRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.dto.response.RecipeResponse;
import be.vives.ti.backend.exceptions.ResourceNotFoundException;
import be.vives.ti.backend.mapper.CropMapper;
import be.vives.ti.backend.mapper.RecipeMapper;
import be.vives.ti.backend.mapper.UserMapper;
import be.vives.ti.backend.model.Crop;
import be.vives.ti.backend.model.Recipe;
import be.vives.ti.backend.model.User;
import be.vives.ti.backend.repository.CropRepository;
import be.vives.ti.backend.repository.RecipeRepository;
import be.vives.ti.backend.repository.UserRepository;
import be.vives.ti.backend.dto.response.UserResponse;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@Transactional
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CropMapper cropMapper;
    private final CropRepository cropRepository;
    private final RecipeMapper recipeMapper;
    private final RecipeRepository recipeRepository;

    public UserService(UserRepository userRepository, UserMapper userMapper, CropMapper cropMapper, CropRepository cropRepository, RecipeMapper recipeMapper, RecipeRepository recipeRepository){
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.cropMapper = cropMapper;
        this.cropRepository = cropRepository;
        this.recipeMapper = recipeMapper;
        this.recipeRepository = recipeRepository;
    }

    public Page<UserResponse> findAll(Pageable pageable){
        log.debug("Finding all users with pagination: {}", pageable);
        Page<User> userPage = userRepository.findAll(pageable);
        return userPage.map(userMapper::toResponse);
    }

    public UserResponse findById(int id){
        log.debug("Finding user with id: {}", id);
        User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
        return userMapper.toResponse(user);
    }

    public UserResponse create(CreateUserRequest request){
        log.debug("Checking if email is already used");
        if(userRepository.findByEmail(request.email()).isPresent()){
            throw new IllegalArgumentException("Email already in use");
        }
        log.debug("Creating new user: {}", request.email());
        User user = userMapper.toEntity(request);
        User savedUser = userRepository.save(user);
        log.info("User created with ID: {}", savedUser.getId());
        return userMapper.toResponse(savedUser);
    }

    public List<CropResponse> findFavoriteCrops(int userId){
        log.debug("Finding favorite crops for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return user.getFavoriteCrops()
                .stream()
                .map(cropMapper::toResponse)
                .toList();
    }

    public void addFavoriteCrop(int userId, int cropId){
        log.debug("Adding favorite crop ID: {} for user ID: {}", cropId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop", cropId));

        user.addFavoriteCrop(crop);
        userRepository.save(user);
        log.info("Crop ID: {} added to user ID: {} favorite crops", cropId, userId);
    }

    public void removeFavoriteCrop(int userId, int cropId){
        log.debug("Removing favorite crop ID: {} for user ID: {}", cropId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new ResourceNotFoundException("Crop", cropId));

        user.removeFavoriteCrop(crop);
        userRepository.save(user);
        log.info("Crop ID: {} removed from user ID: {} favorite crops", cropId, userId);
    }

    public List<RecipeResponse> getFavoriteRecipes(int userId){
        log.debug("Finding favorite recipes for user ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return user.getFavoriteRecipes()
                .stream()
                .map(recipeMapper::toResponse)
                .toList();
    }

    public void addFavoriteRecipe(int userId, int recipeId){
        log.debug("Adding favorite recipe ID: {} for user ID: {}", recipeId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", recipeId));

        user.addFavoriteRecipe(recipe);
        userRepository.save(user);
        log.info("Recipe ID: {} added to user ID: {} favorite recipes", recipeId, userId);
    }

    public void removeFavoriteRecipe(int userId, int recipeId){
        log.debug("Removing favorite recipe ID: {} for user ID: {}", recipeId, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", recipeId));

        user.removeFavoriteRecipe(recipe);
        userRepository.save(user);
        log.info("Recipe ID: {} removed from user ID: {} favorite recipes", recipeId, userId);
    }

    public UserResponse update(int id, UpdateUserRequest request){
        log.debug("Updating user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        userMapper.updateEntity(request, user);
        User updatedUser = userRepository.save(user);
        log.info("User with ID: {} updated successfully", id);
        return userMapper.toResponse(updatedUser);
    }

    public void delete(int id){
        log.debug("Deleting user with ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        userRepository.delete(user);
        log.info("User with ID: {} deleted successfully", id);
    }
}
