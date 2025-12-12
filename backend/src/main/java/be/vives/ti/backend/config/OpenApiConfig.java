package be.vives.ti.backend.config;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Gardening API",
                version = "1.0.0",
                description = """
                        RESTful API for managing favorite crops and recipes.
                        
                        **Authentication**: This API uses JWT Bearer token authentication.
                        
                        **Authorization**:
                        - **Anonymous users**: Can view all crops and recipes (GET /api/crops, GET /api/recipes)
                        - **CUSTOMER role**: Can add crops and recipes to their favorites, create new recipes and manage their profile
                        - **ADMIN role**: Can manage crops an recipes (create, update, delete)
                        """
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Local Development"),
                @Server(url = "https://api.gardeningapp.example.com", description = "Production")
        },
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT authentication token. Obtain a token by registering or logging in via /api/auth/register or /api/auth/login"
)
public class OpenApiConfig {
}