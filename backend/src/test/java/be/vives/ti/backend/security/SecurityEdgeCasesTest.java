package be.vives.ti.backend.security;

import be.vives.ti.backend.dto.LoginRequest;
import be.vives.ti.backend.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
public class SecurityEdgeCasesTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void login_withMissingFields_returnsBadRequest() {
        // missing password
        var req = new LoginRequest("someone@example.com", null);
        ResponseEntity<String> resp = restTemplate.postForEntity("/api/auth/login", req, String.class);

        assertThat(resp.getStatusCode().is4xxClientError()).isTrue();
    }

    @Test
    public void register_withEmptyFields_returnsBadRequest() {
        // empty username and email
        var req = new RegisterRequest("", "", "");
        ResponseEntity<String> resp = restTemplate.postForEntity("/api/auth/register", req, String.class);

        assertThat(resp.getStatusCode().is4xxClientError()).isTrue();
    }

    @Test
    public void login_withInvalidJson_returnsBadRequest() {
        // send raw invalid JSON to login endpoint
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>("{ invalid-json }", headers);

        ResponseEntity<String> resp = restTemplate.postForEntity("/api/auth/login", entity, String.class);
        assertThat(resp.getStatusCode().is4xxClientError()).isTrue();
    }
}
