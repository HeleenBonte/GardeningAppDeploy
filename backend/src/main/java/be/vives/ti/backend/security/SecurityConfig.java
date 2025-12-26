package be.vives.ti.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(proxyTargetClass = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors().and()
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // Allow CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/recipes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/crops/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ingredients/**").permitAll()

                        .requestMatchers("/h2-console/**").permitAll()

                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/recipes/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/recipes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/recipes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/recipes/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/crops/**").hasRole( "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/crops/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/crops/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/crops/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/ingredients/**").hasRole( "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/ingredients/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/ingredients/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/ingredients/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/users/*/favorite-crops/**", "/api/users/*/favorite-recipes/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/users/*/favorite-crops/**", "/api/users/*/favorite-recipes/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*/favorite-crops/**", "/api/users/*/favorite-recipes/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole( "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/users/{id}").hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/measurements").hasAnyRole("USER", "ADMIN")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all origins via patterns so browsers accept wildcard with credentials in development
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // or restrict to your frontend origin(s)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}