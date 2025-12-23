package be.vives.ti.backend.mapper;

import be.vives.ti.backend.dto.request.CreateUserRequest;
import be.vives.ti.backend.dto.request.UpdateUserRequest;
import be.vives.ti.backend.dto.response.UserResponse;
import be.vives.ti.backend.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", unmappedTargetPolicy = org.mapstruct.ReportingPolicy.IGNORE)
public interface UserMapper {
    @Mapping(target = "role", source = "role")
    @Mapping(target = "userEmail", source = "email")
    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "favoriteCrops", ignore = true)
    @Mapping(target = "favoriteRecipes", ignore = true)
    @Mapping(target = "ownRecipes", ignore = true)
    @Mapping(target = "password", ignore = true)
    void updateEntity(UpdateUserRequest request, @MappingTarget User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "favoriteCrops", ignore = true)
    @Mapping(target = "favoriteRecipes", ignore = true)
    @Mapping(target = "ownRecipes", ignore = true)
    User toEntity(CreateUserRequest request);
}
