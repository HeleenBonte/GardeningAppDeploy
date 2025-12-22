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
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
public class ProtectedEndpointTokenTest {

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

    private String loginAndGetToken(String email, String password) {
        var req = new LoginRequest(email, password);
        ResponseEntity<AuthResponse> resp = restTemplate.postForEntity("/api/auth/login", req, AuthResponse.class);
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        return resp.getBody().getToken();
    }

    @Test
    public void accessProtectedEndpoint_withValidToken_returnsOk() {
        var admin = new User();
        admin.setUserName("admin");
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("adminpw"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        String token = loginAndGetToken("admin@example.com", "adminpw");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<String> resp = restTemplate.exchange("/api/users?page=0&size=20", HttpMethod.GET, entity, String.class);
        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void accessProtectedEndpoint_withoutToken_returnsUnauthorizedOrForbidden() {
        ResponseEntity<String> resp = restTemplate.getForEntity("/api/users?page=0&size=20", String.class);
        assertThat(resp.getStatusCode().is4xxClientError()).isTrue();
    }
}

