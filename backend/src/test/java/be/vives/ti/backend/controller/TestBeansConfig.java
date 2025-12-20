package be.vives.ti.backend.controller;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.mockito.Mockito;

import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.security.CustomUserDetailsService;
import be.vives.ti.backend.repository.UserRepository;

@TestConfiguration
public class TestBeansConfig {
    // Provide a test/mocked JwtUtil so ApplicationContext can be loaded by controller slice tests.
    // This class is test-scope only and will not be packaged with the application.
    @Bean
    public JwtUtil jwtUtil() {
        return Mockito.mock(JwtUtil.class);
    }

    // Mock the CustomUserDetailsService so security-related filters can be constructed without JPA.
    @Bean
    public CustomUserDetailsService customUserDetailsService() {
        return Mockito.mock(CustomUserDetailsService.class);
    }

    // Mock UserRepository to avoid triggering JPA EntityManager resolution in test contexts.
    @Bean
    public UserRepository userRepository() {
        return Mockito.mock(UserRepository.class);
    }
}
