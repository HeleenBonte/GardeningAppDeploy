package be.vives.ti.backend.security;

import be.vives.ti.backend.dto.response.UserResponse;
import be.vives.ti.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.mockito.Mockito;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(SecurityIntegrationTest.TestConfig.class)
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public UserService userService() {
            return Mockito.mock(UserService.class);
        }

        @Bean
        public JwtUtil jwtUtil() { return Mockito.mock(JwtUtil.class); }

        @Bean
        public UserDetailsService userDetailsService() { return Mockito.mock(UserDetailsService.class); }

        @Bean
        public jakarta.servlet.Filter securityDebugFilter() {
            return new jakarta.servlet.Filter() {
                @Override
                public void doFilter(jakarta.servlet.ServletRequest request, jakarta.servlet.ServletResponse response, jakarta.servlet.FilterChain chain)
                        throws java.io.IOException, jakarta.servlet.ServletException {
                    var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    System.out.println("[SEC-DEBUG] Authentication in filter chain: " + auth);
                    chain.doFilter(request, response);
                }
            };
        }

        // no diagnostic filter - rely on request post-processors to provide authentication
    }

    @Test
    public void getAllUsers_asUser_forbidden() throws Exception {
        mockMvc.perform(get("/api/users").with(user("user").roles("USER")).param("page", "0").param("size", "20"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void getAllUsers_asAdmin_ok() throws Exception {
        var user = new UserResponse(2, "jane", "jane@example.com", "ADMIN");
        Pageable pageable = PageRequest.of(0, 20);
        when(userService.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(user), pageable, 1));

        mockMvc.perform(get("/api/users").with(user("admin").roles("ADMIN")).param("page", "0").param("size", "20").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].userName").value("jane"));
    }
}
