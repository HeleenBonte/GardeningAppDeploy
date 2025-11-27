package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.request.CreateUserRequest;
import be.vives.ti.backend.dto.response.UserResponse;
import be.vives.ti.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "role", source = "role")
    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "favoriteCrops", ignore = true)
    @Mapping(target = "favoriteRecipes", ignore = true)
    @Mapping(target = "ownRecipes", ignore = true)
    User toEntity(CreateUserRequest request);
}
