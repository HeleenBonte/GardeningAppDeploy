package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.LoginRequest;
import be.vives.ti.backend.dto.RegisterRequest;
import be.vives.ti.backend.dto.AuthResponse;
import be.vives.ti.backend.exceptions.GardeningappException;
import be.vives.ti.backend.model.Role;
import be.vives.ti.backend.model.User;
import be.vives.ti.backend.repository.UserRepository;
import be.vives.ti.backend.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "APIs for user authentication and registration")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    @Operation(
            summary = "Register a new customer",
            description = "Creates a new customer account with CUSTOMER role. Returns a JWT token for immediate authentication."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Customer registered successfully",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid registration data or email already exists")
    })
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            //throw new PizzaStoreException("Email already exists");
        }

        User user = new User();
        user.setUserName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        AuthResponse response = new AuthResponse(
                token,
                user.getEmail(),
                user.getUserName(),
                user.getRole().name()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(
            summary = "Login",
            description = "Authenticates a customer with email and password. Returns a JWT token for subsequent authenticated requests."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Login successful",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid email or password")
    })
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new GardeningappException("User not found"));

            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            AuthResponse response = new AuthResponse(
                    token,
                    user.getEmail(),
                    user.getUserName(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            throw new GardeningappException("Invalid email or password");
        }
    }
}