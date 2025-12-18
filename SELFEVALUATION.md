# Zelfevaluatie checklist voor Java Spring Boot applicatie

## Deel 1: Technisch overzicht

### 1. Beschrijving van de applicatie

Dit is een Gardening API die gebruikers in staat stelt om gewassen (crops) en recepten te beheren. De applicatie biedt functionaliteit voor het bekijken van gewassen met zaai- en oogstinformatie, het beheren van recepten met ingrediënten en bereidingsstappen, en het opslaan van favorieten. Gebruikers kunnen recepten aanmaken en bekijken, waarbij elk recept ingrediënten bevat die gekoppeld kunnen worden aan gewassen. De applicatie ondersteunt verschillende gebruikersrollen (USER en ADMIN) met verschillende toegangsrechten. Er is ook een link tussen ingrediënten en gewassen, waardoor gebruikers kunnen zien welke groenten ze zelf kunnen kweken voor hun recepten.

### 2. Java- en Spring Boot-versie

- **Java versie**: 25
- **Spring Boot versie**: 3.5.7

### 3. URL van de gedeployde Swagger/OpenAPI-documentatie

Niet beschikbaar in productie. Lokaal beschikbaar op:
- Development: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs

### 4. Testgebruikers en rollen

| Rol   | Gebruikersnaam           | Wachtwoord | Email                       |
|-------|--------------------------|------------|-----------------------------|
| ADMIN | John Doe                 | password   | john.doe@example.com        |
| USER  | Jane Doe                 | password   | jane.doe@example.com        |
| USER  | Someone Else             | password   | someone.else@example.com    |

**Opmerking**: Wachtwoorden zijn gehashed in de database met BCrypt. De plaintext wachtwoorden hierboven zijn wat gebruikt moet worden bij login.

### 5. Database

**Type**: Hybrid database setup
- **Development**: H2 in-memory database (jdbc:h2:mem:devdb)
- **Production**: PostgreSQL database (configureerbaar via environment variables)

**Opzet**: 
- Database wordt automatisch aangemaakt bij opstarten in dev-profiel
- Schema wordt gegenereerd via JPA/Hibernate (create-drop in dev, validate in prod)
- Test data wordt geladen via data.sql in development
- PostgreSQL database draait in Docker container voor productie

### 6. Overzicht Controllers, Services, Repositories en Entities

| Controller         | Service(s)                     | Repository/Repositories                                                          | Entity/Entities                                           | Functionaliteit |
|--------------------|--------------------------------|----------------------------------------------------------------------------------|-----------------------------------------------------------|-----------------|
| RecipeController   | RecipeService                  | RecipeRepository, CategoryRepository, CourseRepository, UserRepository, IngredientRepository, IngredientMeasurementRepository, RecipeQuantityRepository, RecipeStepRepository | Recipe, Category, Course, User, Ingredient, IngredientMeasurement, RecipeQuantity, RecipeStep | Volledige CRUD voor recepten, filtering op category/course/ingredient, paginatie, child-records (steps, quantities) |
| CropController     | CropService                    | CropRepository                                                                   | Crop                                                      | GET all crops (paginatie), GET crop by ID |
| AuthController     | CustomUserDetailsService       | UserRepository                                                                   | User                                                      | Registratie en login met JWT authenticatie |
| UserController     | UserService, RecipeService, CropService | UserRepository, RecipeRepository, CropRepository                                 | User, Recipe, Crop                                        | GET all users (paginatie) - andere endpoints nog niet geïmplementeerd |
| IngredientController | Geen service geïmplementeerd   | Geen                                                                             | Ingredient                                                | Alleen lege klasse met comments - niet geïmplementeerd |

**Volgorde**: Geordend van meest naar minst uitgewerkt.

### 7. Authenticatie

Authenticatie is voorzien via **JWT (JSON Web Tokens)**:

- **Registratie**: `/api/auth/register` endpoint voor het aanmaken van nieuwe gebruikers met USER rol
- **Login**: `/api/auth/login` endpoint voor authenticatie met email en wachtwoord
- **Token generatie**: JwtUtil classe genereert tokens met gebruiker email en rol
- **Token validatie**: JwtAuthenticationFilter intercepteert alle requests en valideert JWT tokens
- **Password encoding**: BCryptPasswordEncoder wordt gebruikt voor het hashen van wachtwoorden
- **UserDetailsService**: CustomUserDetailsService implementeert Spring Security UserDetailsService
- **Security configuratie**: SecurityConfig defineert welke endpoints publiek toegankelijk zijn en welke authenticatie vereisen
- **Rolgebaseerde autorisatie**: Verschillende endpoints hebben verschillende rol-vereisten (USER, ADMIN)

---

## Deel 2: Checklist

| Nr | Categorie                | Vereiste                                                         | ✅/⚠️/❌ | Opmerking/commentaar |
|----|--------------------------|------------------------------------------------------------------|----------|---------------------|
| 0  | Algemeen                 | Alle code compileert                                             | ⚠️       | Kan niet verifiëren - PowerShell 6+ niet beschikbaar. POM.xml configuratie ziet er correct uit met Java 25 en alle dependencies. |
| 0  | Algemeen                 | Maven build succesvol                                            | ⚠️       | Kan niet verifiëren - PowerShell 6+ niet beschikbaar. POM.xml structuur is correct met spring-boot-maven-plugin. |
| 0  | Algemeen                 | Dependency Injection overal correct gebruikt                     | ✅       | Constructor injection correct gebruikt in alle controllers en services. |
| 0  | Algemeen                 | Java versie is 25 en minstens Spring Boot 3                      | ✅       | Java 25 en Spring Boot 3.5.7 in pom.xml geconfigureerd. |
| 1  | Functionele werking      | App start vlot op met dev-profiel                                | ⚠️       | Kan niet testen zonder PowerShell 6+. Configuratie ziet er correct uit met dev profiel als default. |
| 1  | Functionele werking      | Alle endpoints functioneren foutloos (CRUD, filtering, security) | ⚠️       | Kan niet testen. Sommige controllers zijn niet volledig geïmplementeerd (IngredientController is leeg, UserController heeft veel lege endpoints). |
| 1  | Functionele werking      | Geen 5xx-fouten bij gebruik                                      | ⚠️       | Kan niet testen. Error handling is aanwezig via custom exceptions (GardeningappException, RecipeException). |
| 2  | Persistentie             | Entiteiten correct geconfigureerd                                | ✅       | Entities hebben correcte JPA annotaties (@Entity, @Table, @Column, @Id). BaseEntity met @MappedSuperclass voor gemeenschappelijke velden. |
| 2  | Persistentie             | Relaties correct geïmplementeerd                                 | ✅       | @ManyToOne, @OneToMany, @ManyToMany correct gebruikt. Bidirectionele relaties met mappedBy. Cascade en orphanRemoval correct geconfigureerd. |
| 2  | Persistentie             | Geen FetchType.EAGER op veel-relaties                            | ✅       | Geen FetchType.EAGER gevonden in de codebase. Default LAZY loading wordt gebruikt. |
| 3  | Testen                   | Unit tests voor controllers aanwezig                             | ❌       | Alleen BackendApplicationTests (context load test) aanwezig, geen controller tests. |
| 3  | Testen                   | Unit tests voor repository-methodes aanwezig                     | ❌       | Geen repository tests aanwezig. |
| 3  | Testen                   | (Indien van toepassing) Service-lagen getest                     | ❌       | Geen service tests aanwezig. |
| 3  | Testen                   | "Happy flows" voor alle endpoints getest                         | ❌       | Geen endpoint tests aanwezig. |
| 3  | Testen                   | Edge cases & foutafhandeling getest                              | ❌       | Geen tests voor edge cases of error handling. |
| 3  | Testen                   | Beveiligde endpoints (verschillende rollen) getest               | ❌       | Geen security tests aanwezig. Spring Security Test dependency wel aanwezig in pom.xml. |
| 4  | REST API & documentatie  | Minstens 2 controllers geïmplementeerd                           | ✅       | 4 controllers aanwezig (RecipeController, CropController, AuthController, UserController). |
| 4  | REST API & documentatie  | Minstens 1 controller met volledige CRUD-functionaliteit         | ⚠️       | RecipeController heeft CREATE (POST) en UPDATE (PUT), maar geen DELETE. GET operaties aanwezig. |
| 4  | REST API & documentatie  | Minstens 1 controller met child-records benaderbaar              | ✅       | RecipeController beheert child-records: RecipeStep en RecipeQuantity via de Recipe entity. |
| 4  | REST API & documentatie  | Correcte HTTP-methodes en statuscodes gebruikt                   | ✅       | GET, POST, PUT gebruikt. ResponseEntity met correct gebruik van HttpStatus (201 CREATED, 200 OK, 404 NOT FOUND). |
| 4  | REST API & documentatie  | Consistente, duidelijke endpoint-structuur                       | ✅       | RESTful structuur: /api/recipes, /api/crops, /api/users, /api/auth. Logische sub-resources zoals /api/recipes/category/{id}. |
| 4  | REST API & documentatie  | Paginatie aanwezig indien relevant                               | ✅       | Pageable parameter gebruikt in RecipeController, CropController en UserController met @ParameterObject annotatie. |
| 4  | REST API & documentatie  | RESTful URL-patterns gevolgd                                     | ✅       | Correcte RESTful patterns: resource-gebaseerde URLs, geen verbs in URLs, gebruik van path parameters voor IDs. |
| 4  | REST API & documentatie  | OpenAPI/Swagger-documentatie volledig & beschikbaar              | ✅       | Springdoc OpenAPI geconfigureerd met OpenApiConfig. @Operation, @ApiResponses, @Tag annotaties op controllers. Swagger UI enabled. |
| 4  | REST API & documentatie  | Controllers voldoende gedocumenteerd                             | ✅       | Controllers hebben @Operation annotaties met summary en description. @ApiResponses met verschillende response codes gedocumenteerd. |
| 4  | REST API & documentatie  | Schema-documentatie voor request/response DTO's aanw.            | ✅       | @Schema annotaties op DTO's (CreateRecipeRequest, etc.). Validation constraints gedocumenteerd met messages. |
| 4  | REST API & documentatie  | Documentatie toont endpoints met beveiliging/rollen              | ✅       | @SecurityRequirement annotaties aanwezig. OpenApiConfig beschrijft authenticatie en autorisatie rollen. |
| 4  | REST API & documentatie  | Communicatie via DTO's (nooit directe entities)                  | ✅       | DTOs gebruikt: CreateRecipeRequest, UpdateRecipeRequest, RecipeResponse, CropResponse, UserResponse. MapStruct mappers voor conversie. |
| 4  | REST API & documentatie  | Request DTO's steeds voorzien van validatie                      | ⚠️       | Validatie annotaties aanwezig (@NotBlank, @NotEmpty) maar verkeerd gebruikt op Integer velden. @Valid annotatie alleen in AuthController. |
| 4  | REST API & documentatie  | Inkomende data steeds gevalideerd                                | ⚠️       | @Valid annotatie ontbreekt op @RequestBody parameters in RecipeController. Validatie niet consistent toegepast. |
| 4  | REST API & documentatie  | Foutafhandeling (error handling) geregeld                        | ⚠️       | Custom exceptions (GardeningappException, RecipeException) aanwezig maar geen @ControllerAdvice voor globale exception handling. |
| 5  | Security                 | Authenticatie en autorisatie correct geïmplementeerd             | ✅       | JWT authenticatie met JwtAuthenticationFilter. SecurityConfig met HttpSecurity configuratie voor autorisatie. |
| 5  | Security                 | Minstens twee rollen voorzien                                    | ✅       | Role enum met USER en ADMIN rollen. |
| 5  | Security                 | Rolgebaseerde autorisatie aanwezig                               | ✅       | SecurityConfig gebruikt hasRole() en hasAnyRole() voor verschillende endpoints. |
| 5  | Security                 | Standaardgebruikers voor beide rollen aanwezig                   | ✅       | data.sql bevat users met ADMIN (john.doe) en USER (jane.doe, someone.else) rollen. |
| 5  | Security                 | Geen plaintext passwords (alle passwords gehashed)               | ✅       | BCryptPasswordEncoder gebruikt. Passwords in data.sql zijn gehashed ($2a$10$...). |
| 5  | Security                 | Endpoint voor registratie en authenticatie aanwezig              | ✅       | AuthController met /api/auth/register en /api/auth/login endpoints. |
| 5  | Security                 | Geen conflicterende security rules                               | ⚠️       | Security rules refereren naar endpoints die niet bestaan (/api/customers, /api/orders). Mogelijk copy-paste van ander project. |
| 6  | Profielen                | Minstens 2 profielen (`dev`/`prod`) met aparte DB                | ✅       | application-dev.properties (H2) en application-prod.properties (PostgreSQL) aanwezig. |
| 6  | Profielen                | Correcte profiel-specifieke configuratie                         | ✅       | Dev gebruikt H2 + create-drop + SQL init. Prod gebruikt PostgreSQL + validate + geen SQL init. |
| 6  | Profielen                | Gebruik env variabelen voor gevoelige prod-properties            | ✅       | application-prod.properties gebruikt ${SPRING_DATASOURCE_URL}, ${SPRING_DATASOURCE_USERNAME}, ${SPRING_DATASOURCE_PASSWORD}. |
| 7  | Clean code               | Duidelijke package-structuur, betekenisvolle namen               | ✅       | Logische package structuur: controller, service, repository, model, dto, security, config, mapper, exceptions. |
| 7  | Clean code               | Correcte laag-scheiding (controller, service, repo, model)       | ✅       | Duidelijke scheiding tussen lagen. Controllers gebruiken services, services gebruiken repositories. Geen business logic in controllers. |
| 7  | Clean code               | Code voldoet aan Java & Spring Boot best practices               | ⚠️       | Goede practices: constructor injection, record DTOs, MapStruct. Minder goed: incomplete controllers, geen @ControllerAdvice, geen tests. |

---

## Deel 3: Testcoverage-overzicht

**Test Coverage**: Zeer beperkt - alleen basis context test aanwezig.

```
Total: 1 test class (1 test)

Application Tests: 1 class (1 test)
  - BackendApplicationTests (1 test - context loads)

Repository Tests: 0 classes
Service Tests: 0 classes  
Controller Tests: 0 classes
Integration Tests: 0 classes

Test Coverage: ~0% (alleen context load test)
Success Rate: 100% (1/1 test passes)
```

**Opmerking**: Spring Security Test en Spring Boot Test dependencies zijn aanwezig in pom.xml, maar er zijn geen tests geschreven.

---

## ⭐️ Aanbevelingen

### Sterke punten:
1. **Goede architectuur**: Duidelijke laag-scheiding met gebruik van DTOs, MapStruct mappers en correcte dependency injection
2. **Uitstekende security implementatie**: JWT authenticatie correct geïmplementeerd met rolgebaseerde autorisatie en gehashte wachtwoorden
3. **Professionele API documentatie**: Volledige OpenAPI/Swagger documentatie met beschrijvingen en security annotaties
4. **Correcte JPA relaties**: Complexe relaties (OneToMany, ManyToMany) correct geïmplementeerd zonder EAGER fetching
5. **Goede configuratie**: Twee profielen met aparte databases en environment variables voor productie

### Kritieke verbeterpunten:

1. **Tests ontbreken volledig**: Er zijn geen unit, integration of security tests. Voeg tests toe voor controllers (met @WebMvcTest), services (met @MockBean), repositories (met @DataJpaTest) en security configuratie (met @WithMockUser). Dit is het grootste gemis.

2. **Incomplete implementatie**: IngredientController is leeg, UserController heeft veel niet-geïmplementeerde endpoints (favorites, profile updates). CropController mist POST, PUT, DELETE operaties. RecipeController mist DELETE endpoint. Maak de API compleet.

3. **Inconsistente validatie**: @Valid annotatie wordt niet overal gebruikt op @RequestBody parameters. @NotBlank wordt incorrect gebruikt op Integer/Boolean velden (moet @NotNull zijn). Validatie errors worden niet centraal afgehandeld. Voeg een @ControllerAdvice toe met @ExceptionHandler voor consistente error responses.

4. **Security configuratie bevat dead code**: SecurityConfig bevat regels voor /api/customers en /api/orders endpoints die niet bestaan. Verwijder of implementeer deze endpoints. Controleer of alle security rules matchen met bestaande endpoints.

5. **Error handling kan beter**: Custom exceptions bestaan maar worden niet consistent gebruikt. Geen globale exception handler (@RestControllerAdvice). Service methoden gebruiken soms .orElseThrow() zonder custom message. Voeg een GlobalExceptionHandler toe die alle exceptions (RecipeException, GardeningappException, validation errors, etc.) afhandelt en uniforme error responses retourneert.
