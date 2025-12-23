package be.vives.ti.backend.security;

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
public class AuthIntegrationRolesTest {

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
    public void login_asUser_returnsOk_and_rolePersisted() {
        // arrange: create a USER directly in repository
        var user = new User();
        user.setUserName("regular");
        user.setEmail("user@example.com");
        user.setPassword(passwordEncoder.encode("pw"));
        user.setRole(Role.USER);
        userRepository.save(user);

        // act: attempt login
        var userReq = new be.vives.ti.backend.dto.LoginRequest("user@example.com", "pw");
        ResponseEntity<String> userResp = restTemplate.postForEntity("/api/auth/login", userReq, String.class);

        // assert: login succeeds and role persisted
        assertThat(userResp.getStatusCode().is2xxSuccessful()).isTrue();
        var savedUser = userRepository.findByEmail("user@example.com").orElseThrow();
        assertThat(savedUser.getRole()).isEqualTo(Role.USER);
        assertThat(userResp.getBody()).isNotNull();
    }

    @Test
    public void login_asAdmin_returnsOk_and_rolePersisted() {
        // arrange: create an ADMIN directly in repository
        var admin = new User();
        admin.setUserName("boss");
        admin.setEmail("admin@example.com");
        admin.setPassword(passwordEncoder.encode("adminpw"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // act: attempt login
        var adminReq = new be.vives.ti.backend.dto.LoginRequest("admin@example.com", "adminpw");
        ResponseEntity<String> adminResp = restTemplate.postForEntity("/api/auth/login", adminReq, String.class);

        // assert: login succeeds and role persisted
        assertThat(adminResp.getStatusCode().is2xxSuccessful()).isTrue();
        var savedAdmin = userRepository.findByEmail("admin@example.com").orElseThrow();
        assertThat(savedAdmin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(adminResp.getBody()).isNotNull();
    }
}