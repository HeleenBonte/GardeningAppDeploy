package be.vives.ti.backend.security;

import be.vives.ti.backend.dto.AuthResponse;
import be.vives.ti.backend.dto.LoginRequest;
import be.vives.ti.backend.model.Role;
import be.vives.ti.backend.model.User;
import be.vives.ti.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
public class AuthControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    public void cleanup() {
        userRepository.deleteAll();
    }

    @Test
    public void login_withValidCredentials_returnsToken() {
        // arrange
        var user = new User();
        user.setUserName("inttest");
        user.setEmail("inttest@example.com");
        user.setPassword(passwordEncoder.encode("secret"));
        user.setRole(Role.USER);
        userRepository.save(user);

        var req = new LoginRequest("inttest@example.com", "secret");

        // act
        ResponseEntity<AuthResponse> resp = restTemplate.postForEntity("/api/auth/login", req, AuthResponse.class);

        // assert
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getToken()).isNotNull().isNotEmpty();
    }
}

