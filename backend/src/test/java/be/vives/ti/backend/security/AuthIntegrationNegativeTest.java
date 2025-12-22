package be.vives.ti.backend.security;

import be.vives.ti.backend.dto.LoginRequest;
import be.vives.ti.backend.dto.RegisterRequest;
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
public class AuthIntegrationNegativeTest {

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
    public void login_withBadCredentials_returnsError() {
        // arrange: create a real user
        var user = new User();
        user.setUserName("joe");
        user.setEmail("joe@example.com");
        user.setPassword(passwordEncoder.encode("correctpw"));
        user.setRole(Role.USER);
        userRepository.save(user);

        // act: attempt login with wrong password
        var req = new LoginRequest("joe@example.com", "wrongpw");
        ResponseEntity<String> resp = restTemplate.postForEntity("/api/auth/login", req, String.class);

        // assert: server returns error status; if body present, check message text
        assertThat(resp.getStatusCode().is5xxServerError() || resp.getStatusCode().is4xxClientError()).isTrue();
        if (resp.getBody() != null) {
            assertThat(resp.getBody()).contains("Invalid email or password");
        }
    }

    @Test
    public void register_withDuplicateEmail_returnsError() {
        // arrange: existing user with the same email
        var existing = new User();
        existing.setUserName("existing");
        existing.setEmail("dup@example.com");
        existing.setPassword(passwordEncoder.encode("password"));
        existing.setRole(Role.USER);
        userRepository.save(existing);

        // act: attempt to register with the same email
        var req = new RegisterRequest("newname", "dup@example.com", "newpassword");
        ResponseEntity<String> resp = restTemplate.postForEntity("/api/auth/register", req, String.class);

        // assert: server returns error status; if body present, check message text
        assertThat(resp.getStatusCode().is5xxServerError() || resp.getStatusCode().is4xxClientError()).isTrue();
        if (resp.getBody() != null) {
            assertThat(resp.getBody()).contains("Email already exists");
        }
    }
}
