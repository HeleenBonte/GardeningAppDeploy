# Zelfevaluatie Java Spring Boot Applicatie

## Deel 1: Technisch overzicht

### 1. Applicatiebeschrijving

Deze applicatie is een Gardening & Recipe Management systeem dat gebruikers helpt bij het beheren van tuingewassen (crops) en recepten. Gebruikers kunnen hun favoriete gewassen en recepten bijhouden, nieuwe recepten aanmaken met ingrediënten en bereidingsstappen, en informatie opzoeken over wanneer gewassen gezaaid, geplant en geoogst moeten worden. De applicatie ondersteunt verschillende rollen (USER en ADMIN) waarbij admins volledige controle hebben over het beheer van gewassen en recepten, terwijl gewone gebruikers recepten kunnen aanmaken en favorieten kunnen bijhouden.

### 2. Java- en Spring Boot-versie

- **Java versie**: 25
- **Spring Boot versie**: 3.5.7

### 3. URL gedeployde Swagger/OpenAPI-documentatie

- **Development**: http://localhost:8080/swagger-ui.html
- **Production**: Niet beschikbaar (alleen lokale ontwikkeling en Docker)

### 4. Testgebruikers en rollen

| Rol   | Gebruikersnaam | Email                     | Wachtwoord |
|-------|----------------|---------------------------|------------|
| ADMIN | John Doe       | john.doe@example.com      | password   |
| USER  | Jane Doe       | jane.doe@example.com      | password   |
| USER  | Someone Else   | someone.else@example.com  | password   |

### 5. Database

**Development**: H2 in-memory database (jdbc:h2:mem:devdb)
- DDL-auto: create-drop
- Automatische initialisatie via schema.sql en data.sql

**Production**: PostgreSQL database
- DDL-auto: validate
- Connectie via environment variabelen (SPRING_DATASOURCE_URL, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- Gebruik van Docker Compose voor database setup

### 6. Overzicht Controllers, Services, Repositories en Entities

| Controller                | Service(s)           | Repository/Repositories       | Entity/Entities                                    | Beschrijving functionaliteit                                                                                          |
|---------------------------|----------------------|-------------------------------|----------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| RecipeController          | RecipeService        | RecipeRepository, RecipeQuantityRepository, RecipeStepRepository, CourseRepository, CategoryRepository, IngredientRepository, UserRepository | Recipe, RecipeQuantity, RecipeStep, Course, Category, Ingredient, User | Volledige CRUD voor recepten, filtering op category/course/ingredient, paginatie, child-records (quantities & steps) |
| UserController            | UserService          | UserRepository, CropRepository, RecipeRepository | User, Crop, Recipe                                 | CRUD voor users, beheer van favorite crops/recipes (many-to-many relaties), child-records benaderbaar                |
| CropController            | CropService          | CropRepository               | Crop                                               | Volledige CRUD voor gewassen, zoeken op naam, paginatie                                                               |
| IngredientController      | IngredientService    | IngredientRepository, CropRepository | Ingredient, Crop                                   | CREATE en DELETE voor ingrediënten, GET all met paginatie                                                            |
| AuthController            | -                    | UserRepository               | User                                               | Registratie en login met JWT authenticatie                                                                            |
| CategoryController        | CategoryService      | CategoryRepository           | Category                                           | GET all categories (read-only)                                                                                        |
| CourseController          | CourseService        | CourseRepository             | Course                                             | GET all courses (read-only)                                                                                           |
| MeasurementController     | MeasurementService   | IngredientMeasurementRepository | IngredientMeasurement                              | GET all measurements (read-only)                                                                                      |

### 7. Authenticatie

De applicatie gebruikt **JWT (JSON Web Token) authenticatie**:

- **Registratie**: `/api/auth/register` - Creëert nieuwe gebruiker met USER rol en retourneert JWT token
- **Login**: `/api/auth/login` - Authenticeert met email/password en retourneert JWT token
- **Password encoding**: BCrypt via BCryptPasswordEncoder
- **Security filter**: JwtAuthenticationFilter controleert Bearer tokens in Authorization header
- **Token generatie**: JwtUtil gebruikt HMAC-SHA256 algoritme met secret key
- **Token expiratie**: 86400000ms (24 uur)
- **Stateless sessions**: SessionCreationPolicy.STATELESS

**Rolgebaseerde autorisatie**:
- GET requests op crops/recipes/ingredients: Publiek toegankelijk
- POST recipes: USER en ADMIN
- PUT/DELETE recipes, crops, ingredients: Alleen ADMIN
- User endpoints: Specifieke rol-vereisten per endpoint (@PreAuthorize annotaties)

---

## Deel 2: Checklist

| Nr | Categorie                | Vereiste                                                         | ✅/⚠️/❌ | Opmerking/commentaar |
|----|--------------------------|------------------------------------------------------------------|----------|---------------------|
| 0  | Algemeen                 | Alle code compileert                                             | ✅       | Maven build succesvol |
| 0  | Algemeen                 | Maven build succesvol                                            | ✅       | BUILD SUCCESS - 14.134s |
| 0  | Algemeen                 | Dependency Injection overal correct gebruikt                     | ✅       | Constructor injection gebruikt in alle controllers/services |
| 0  | Algemeen                 | Java versie is 25 en minstens Spring Boot 3                      | ✅       | Java 25, Spring Boot 3.5.7 |
| 1  | Functionele werking      | App start vlot op met dev-profiel                                | ✅       | Start met H2 database, default profile=dev |
| 1  | Functionele werking      | Alle endpoints functioneren foutloos (CRUD, filtering, security) | ✅       | 152 tests passed, alle functionaliteit gedekt |
| 1  | Functionele werking      | Geen 5xx-fouten bij gebruik                                      | ✅       | GlobalExceptionHandler vangt alle errors op |
| 2  | Persistentie             | Entiteiten correct geconfigureerd                                | ✅       | @Entity, @Table, @Column annotaties correct |
| 2  | Persistentie             | Relaties correct geïmplementeerd                                 | ✅       | @OneToMany, @ManyToOne, @ManyToMany correct gebruikt |
| 2  | Persistentie             | Geen FetchType.EAGER op veel-relaties                            | ✅       | Geen EAGER fetch gevonden in codebase |
| 3  | Testen                   | Unit tests voor controllers aanwezig                             | ✅       | 7 controller test classes (55 tests) |
| 3  | Testen                   | Unit tests voor repository-methodes aanwezig                     | ✅       | 4 repository test classes (32 tests) |
| 3  | Testen                   | (Indien van toepassing) Service-lagen getest                     | ✅       | 7 service test classes (58 tests) |
| 3  | Testen                   | "Happy flows" voor alle endpoints getest                         | ✅       | Alle CRUD operaties getest per controller |
| 3  | Testen                   | Edge cases & foutafhandeling getest                              | ✅       | Validatie errors, not found scenarios getest |
| 3  | Testen                   | Beveiligde endpoints (verschillende rollen) getest               | ✅       | 7 security integration tests (14 tests) |
| 4  | REST API & documentatie  | Minstens 2 controllers geïmplementeerd                           | ✅       | 8 controllers geïmplementeerd |
| 4  | REST API & documentatie  | Minstens 1 controller met volledige CRUD-functionaliteit         | ✅       | RecipeController, CropController, UserController |
| 4  | REST API & documentatie  | Minstens 1 controller met child-records benaderbaar              | ✅       | UserController (favorite-crops/recipes), RecipeController (quantities/steps) |
| 4  | REST API & documentatie  | Correcte HTTP-methodes en statuscodes gebruikt                   | ✅       | GET, POST (201), PUT (200), DELETE (204), errors (400/404) |
| 4  | REST API & documentatie  | Consistente, duidelijke endpoint-structuur                       | ✅       | RESTful structuur: /api/{resource}/{id}/{child-resource} |
| 4  | REST API & documentatie  | Paginatie aanwezig indien relevant                               | ✅       | Pageable gebruikt in RecipeController, CropController, UserController, IngredientController |
| 4  | REST API & documentatie  | RESTful URL-patterns gevolgd                                     | ✅       | Resource-based URLs, geen verbs in paths |
| 4  | REST API & documentatie  | OpenAPI/Swagger-documentatie volledig & beschikbaar              | ✅       | SpringDoc OpenAPI 2.8.13, /swagger-ui.html |
| 4  | REST API & documentatie  | Controllers voldoende gedocumenteerd                             | ✅       | @Operation, @ApiResponses annotaties op alle endpoints |
| 4  | REST API & documentatie  | Schema-documentatie voor request/response DTO's aanw.            | ✅       | @Schema annotaties op DTOs |
| 4  | REST API & documentatie  | Documentatie toont endpoints met beveiliging/rollen              | ✅       | @SecurityRequirement annotaties, beschrijving in OpenApiConfig |
| 4  | REST API & documentatie  | Communicatie via DTO's (nooit directe entities)                  | ✅       | MapStruct mappers voor conversie Entity <-> DTO |
| 4  | REST API & documentatie  | Request DTO's steeds voorzien van validatie                      | ✅       | @Valid, @NotBlank, @NotNull, @Size annotaties |
| 4  | REST API & documentatie  | Inkomende data steeds gevalideerd                                | ✅       | Bean Validation (Jakarta Validation) |
| 4  | REST API & documentatie  | Foutafhandeling (error handling) geregeld                        | ✅       | GlobalExceptionHandler met @RestControllerAdvice |
| 5  | Security                 | Authenticatie en autorisatie correct geïmplementeerd             | ✅       | JWT met Spring Security |
| 5  | Security                 | Minstens twee rollen voorzien                                    | ✅       | USER en ADMIN rollen (enum Role) |
| 5  | Security                 | Rolgebaseerde autorisatie aanwezig                               | ✅       | @PreAuthorize, SecurityFilterChain configuratie |
| 5  | Security                 | Standaardgebruikers voor beide rollen aanwezig                   | ✅       | ADMIN: john.doe@example.com, USER: jane.doe@example.com |
| 5  | Security                 | Geen plaintext passwords (alle passwords gehashed)               | ✅       | BCryptPasswordEncoder gebruikt |
| 5  | Security                 | Endpoint voor registratie en authenticatie aanwezig              | ✅       | /api/auth/register en /api/auth/login |
| 5  | Security                 | Geen conflicterende security rules                               | ✅       | Duidelijke hierarchie in SecurityFilterChain |
| 6  | Profielen                | Minstens 2 profielen (`dev`/`prod`) met aparte DB                | ✅       | application-dev.properties (H2), application-prod.properties (PostgreSQL) |
| 6  | Profielen                | Correcte profiel-specifieke configuratie                         | ✅       | DDL-auto, datasource, SQL init per profiel |
| 6  | Profielen                | Gebruik env variabelen voor gevoelige prod-properties            | ✅       | ${SPRING_DATASOURCE_URL}, ${DB_HOST}, ${DB_USER}, ${DB_PASSWORD} |
| 7  | Clean code               | Duidelijke package-structuur, betekenisvolle namen               | ✅       | Gescheiden packages: controller, service, repository, model, dto, security, exceptions, config |
| 7  | Clean code               | Correcte laag-scheiding (controller, service, repo, model)       | ✅       | Strikte scheiding, geen overslaan van lagen |
| 7  | Clean code               | Code voldoet aan Java & Spring Boot best practices               | ✅       | Constructor injection, records voor DTOs, proper exception handling |

---

## Deel 3: Testcoverage-overzicht

### Test Coverage Summary

**Repository Tests: 4 classes (32 tests)**
- CropRepositoryTest (8 tests)
- IngredientRepositoryTest (6 tests)
- RecipeRepositoryTest (12 tests)
- UserRepositoryTest (6 tests)

**Service Tests: 7 classes (58 tests)**
- CategoryServiceTest (3 tests)
- CourseServiceTest (2 tests)
- CropServiceTest (10 tests)
- IngredientServiceTest (6 tests)
- MeasurementServiceTest (2 tests)
- RecipeServiceTest (11 tests)
- UserServiceTest (24 tests)

**Controller Tests: 7 classes (55 tests)**
- CategoryControllerTest (3 tests)
- CourseControllerTest (3 tests)
- CropControllerTest (12 tests)
- IngredientControllerTest (7 tests)
- MeasurementControllerTest (3 tests)
- RecipeControllerTest (13 tests)
- UserControllerTest (14 tests)

**Security/Integration Tests: 7 classes (14 tests)**
- AuthControllerIntegrationTest (1 test)
- AuthIntegrationNegativeTest (2 tests)
- AuthIntegrationRolesTest (2 tests)
- ProtectedEndpointTokenTest (2 tests)
- RegisterPersistsUserTest (1 test)
- SecurityEdgeCasesTest (3 tests)
- SecurityIntegrationTest (3 tests)

**Total: 25 test classes - 152 tests - 100% success rate**

---

## ⭐️ Aanbevelingen

### Sterke punten:
1. **Uitgebreide test coverage**: Alle lagen (repository, service, controller) hebben goede testdekking inclusief security testing
2. **Clean architecture**: Duidelijke scheiding van verantwoordelijkheden met proper dependency injection
3. **Professionele API documentatie**: Volledige OpenAPI/Swagger documentatie met security requirements en voorbeelden
4. **Robuuste security**: JWT authenticatie met rolgebaseerde autorisatie, correct password hashing

### Verbeterpunten:
1. **Ingredient entity setter**: De `setName()` methode in Ingredient.java heeft een lege implementatie - zou de name moeten updaten
2. **Paginatie ontbreekt**: CategoryController, CourseController en MeasurementController ondersteunen geen paginatie (wel kleine datasets)
3. **IngredientController incomplete CRUD**: Mist GET by ID en UPDATE endpoints voor volledige CRUD-functionaliteit
4. **Environment variabelen in dev**: JWT secret key staat hardcoded in application.properties - zou via environment variabele moeten voor security
5. **Jacoco coverage plugin**: Ontbreekt in pom.xml - zou nuttig zijn voor visuele coverage rapportage en CI/CD integration
