package be.vives.ti.backend.service;


import be.vives.ti.backend.mapper.UserMapper;
import be.vives.ti.backend.model.User;
import be.vives.ti.backend.repository.UserRepository;
import be.vives.ti.backend.dto.response.UserResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    public UserService(UserRepository userRepository, UserMapper userMapper){
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public Page<UserResponse> findAll(Pageable pageable){
        Page<User> userPage = userRepository.findAll(pageable);
        return userPage.map(userMapper::toResponse);
    }
}
