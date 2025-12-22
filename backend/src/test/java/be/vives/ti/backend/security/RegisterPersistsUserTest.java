package be.vives.ti.backend.security;

import be.vives.ti.backend.dto.AuthResponse;
import be.vives.ti.backend.dto.RegisterRequest;
import be.vives.ti.backend.model.User;
import be.vives.ti.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
public class RegisterPersistsUserTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @AfterEach
    public void cleanup() {
        userRepository.deleteAll();
    }

    @Test
    public void register_createsUser_andReturnsToken() {
        var req = new RegisterRequest("newuser", "newuser@example.com", "pw12345");
        ResponseEntity<AuthResponse> resp = restTemplate.postForEntity("/api/auth/register", req, AuthResponse.class);

        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(resp.getBody()).isNotNull();
        assertThat(resp.getBody().getToken()).isNotNull();

        var found = userRepository.findByEmail("newuser@example.com");
        assertThat(found).isPresent();
        User u = found.get();
        assertThat(u.getUserName()).isEqualTo("newuser");
    }
}

