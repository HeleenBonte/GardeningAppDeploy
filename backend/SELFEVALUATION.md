# Zelfevaluatie checklist voor Java Spring Boot applicatie

## Deel 1: Technisch overzicht

### 1. Beschrijving van de applicatie

Deze applicatie is een recepten- en tuinbeheer systeem dat gebruikers helpt bij het beheren van recepten, gewassen (crops) en ingrediënten. De applicatie biedt functionaliteit voor:
- Het creëren, bewerken en verwijderen van recepten met ingrediënten, hoeveelheden en bereidingsstappen
- Het beheren van gewassen met informatie over zaai-, plant- en oogstperiodes
- Het bijhouden van favoriete recepten en gewassen per gebruiker
- Authenticatie en autorisatie met JWT tokens
- Rolgebaseerde toegangscontrole (USER en ADMIN rollen)

De applicatie fungeert als backend voor een cross-platform applicatie en biedt een RESTful API met volledige OpenAPI/Swagger documentatie.

### 2. Java en Spring Boot versie

- **Java versie**: 25
- **Spring Boot versie**: 3.5.7

### 3. URL van gedeployde Swagger/OpenAPI-documentatie

Niet gedeployed in productie. Lokaal beschikbaar op: `http://localhost:8080/swagger-ui.html`

### 4. Testgebruikers en rollen

| Rolnaam | Gebruikersnaam | Email | Wachtwoord |
|---------|----------------|-------|------------|
| ADMIN | John Doe | john.doe@example.com | password |
| USER | Jane Doe | jane.doe@example.com | password |
| USER | Someone Else | someone.else@example.com | password |

### 5. Database

**Type**: 
- **Development**: H2 in-memory database
- **Productie**: PostgreSQL

**Setup**:
- Development profiel gebruikt H2 met `create-drop` strategie en laadt testdata via `data.sql`
- Productie profiel gebruikt PostgreSQL met `validate` strategie
- Database configuratie via profielen (`application-dev.properties` en `application-prod.properties`)
- Schema wordt automatisch gegenereerd door JPA/Hibernate in dev mode

### 6. Overzicht controllers, services, repositories en entities

| Controller | Service | Repository | Entities | Opmerkingen |
|------------|---------|------------|----------|-------------|
| RecipeController | RecipeService | RecipeRepository, RecipeQuantityRepository, RecipeStepRepository | Recipe, RecipeQuantity, RecipeStep | Volledige CRUD, filtering op category/course/ingredient, paginatie, child records (quantities en steps) |
| UserController | UserService | UserRepository | User | Volledige CRUD, favoriete crops en recipes beheer, many-to-many relaties |
| CropController | CropService | CropRepository | Crop | Volledige CRUD, filtering op naam, paginatie |
| IngredientController | IngredientService | IngredientRepository | Ingredient, IngredientMeasurement | CRUD operaties, link met Crop (one-to-one) |
| CategoryController | CategoryService | CategoryRepository | Category | Read-only, referentiedata |
| CourseController | CourseService | CourseRepository | Course | Read-only, referentiedata |
| MeasurementController | MeasurementService | IngredientMeasurementRepository | IngredientMeasurement | Read-only, referentiedata |
| AuthController | - | UserRepository | User | Registratie en login endpoints |

### 7. Authenticatie

De applicatie gebruikt **JWT (JSON Web Token) gebaseerde authenticatie**:

- **Registratie**: `/api/auth/register` - nieuwe gebruikers worden aangemaakt met USER rol, wachtwoord wordt gehashed met BCrypt
- **Login**: `/api/auth/login` - authenticatie via email/wachtwoord, retourneert JWT token
- **Token validatie**: JwtAuthenticationFilter intercepteert alle requests en valideert JWT tokens
- **Autorisatie**: SecurityConfig definieert rolgebaseerde toegangscontrole per endpoint
- **Password encoding**: BCryptPasswordEncoder voor veilige wachtwoord opslag
- **Rollen**: USER en ADMIN (enum Role)
- **Security configuratie**: Stateless sessies, CSRF disabled (geschikt voor REST API)

---

## Deel 2: Checklist

| Nr | Categorie                | Vereiste                                                         | ✅/⚠️/❌ | Opmerking/commentaar |
|----|--------------------------|------------------------------------------------------------------|----------|---------------------|
| 0  | Algemeen                 | Alle code compileert                                             | ✅ | Build succesvol zonder fouten |
| 0  | Algemeen                 | Maven build succesvol                                            | ✅ | `mvn clean compile` slaagt |
| 0  | Algemeen                 | Dependency Injection overal correct gebruikt                     | ✅ | Constructor injection consistent toegepast |
| 0  | Algemeen                 | Java versie is 25 en minstens Spring Boot 3                      | ✅ | Java 25, Spring Boot 3.5.7 |
| 1  | Functionele werking      | App start vlot op met dev-profiel                                | ✅ | H2 database, testdata wordt geladen |
| 1  | Functionele werking      | Alle endpoints functioneren foutloos (CRUD, filtering, security) | ✅ | Alle tests slagen (142 tests) |
| 1  | Functionele werking      | Geen 5xx-fouten bij gebruik                                      | ✅ | GlobalExceptionHandler aanwezig voor foutafhandeling |
| 2  | Persistentie             | Entiteiten correct geconfigureerd                                | ✅ | @Entity, @Table, @Column correct gebruikt |
| 2  | Persistentie             | Relaties correct geïmplementeerd                                 | ✅ | @ManyToOne, @OneToMany, @ManyToMany, @OneToOne correct |
| 2  | Persistentie             | Geen FetchType.EAGER op veel-relaties                            | ✅ | Default LAZY fetch gebruikt |
| 3  | Testen                   | Unit tests voor controllers aanwezig                             | ✅ | 7 controller test classes (55 tests) |
| 3  | Testen                   | Unit tests voor repository-methodes aanwezig                     | ✅ | 4 repository test classes (30 tests) |
| 3  | Testen                   | (Indien van toepassing) Service-lagen getest                     | ✅ | 7 service test classes (55 tests) |
| 3  | Testen                   | "Happy flows" voor alle endpoints getest                         | ✅ | CRUD operaties worden getest |
| 3  | Testen                   | Edge cases & foutafhandeling getest                              | ✅ | NotFound scenarios, validatie fouten getest |
| 3  | Testen                   | Beveiligde endpoints (verschillende rollen) getest               | ⚠️ | Security integration tests aanwezig (9 tests) maar beperkt |
| 4  | REST API & documentatie  | Minstens 2 controllers geïmplementeerd                           | ✅ | 8 controllers geïmplementeerd |
| 4  | REST API & documentatie  | Minstens 1 controller met volledige CRUD-functionaliteit         | ✅ | Recipe, Crop, User hebben volledige CRUD |
| 4  | REST API & documentatie  | Minstens 1 controller met child-records benaderbaar              | ✅ | Recipe heeft child records (quantities, steps), User heeft favorites |
| 4  | REST API & documentatie  | Correcte HTTP-methodes en statuscodes gebruikt                   | ✅ | GET, POST, PUT, DELETE met 200, 201, 204, 404 |
| 4  | REST API & documentatie  | Consistente, duidelijke endpoint-structuur                       | ✅ | RESTful structuur: /api/{resource}/{id} |
| 4  | REST API & documentatie  | Paginatie aanwezig indien relevant                               | ✅ | Pageable gebruikt in Recipe, Crop, User, Ingredient |
| 4  | REST API & documentatie  | RESTful URL-patterns gevolgd                                     | ✅ | Resource-gebaseerde URLs |
| 4  | REST API & documentatie  | OpenAPI/Swagger-documentatie volledig & beschikbaar              | ✅ | SpringDoc configured, @Operation en @ApiResponse tags |
| 4  | REST API & documentatie  | Controllers voldoende gedocumenteerd                             | ✅ | @Operation met summary en description |
| 4  | REST API & documentatie  | Schema-documentatie voor request/response DTO's aanw.            | ✅ | @Schema tags op DTO's, validatie annotaties |
| 4  | REST API & documentatie  | Documentatie toont endpoints met beveiliging/rollen              | ✅ | @SecurityRequirement op beveiligde endpoints |
| 4  | REST API & documentatie  | Communicatie via DTO's (nooit directe entities)                  | ✅ | Request/Response DTO packages, MapStruct mappers |
| 4  | REST API & documentatie  | Request DTO's steeds voorzien van validatie                      | ✅ | @Valid, @NotBlank, @NotNull, @NotEmpty gebruikt |
| 4  | REST API & documentatie  | Inkomende data steeds gevalideerd                                | ✅ | Jakarta validation annotations |
| 4  | REST API & documentatie  | Foutafhandeling (error handling) geregeld                        | ✅ | GlobalExceptionHandler met @RestControllerAdvice |
| 5  | Security                 | Authenticatie en autorisatie correct geïmplementeerd             | ✅ | JWT met JwtAuthenticationFilter |
| 5  | Security                 | Minstens twee rollen voorzien                                    | ✅ | USER en ADMIN roles |
| 5  | Security                 | Rolgebaseerde autorisatie aanwezig                               | ✅ | hasRole(), hasAnyRole() in SecurityConfig |
| 5  | Security                 | Standaardgebruikers voor beide rollen aanwezig                   | ✅ | Admin en User accounts in data.sql |
| 5  | Security                 | Geen plaintext passwords (alle passwords gehashed)               | ✅ | BCryptPasswordEncoder gebruikt |
| 5  | Security                 | Endpoint voor registratie en authenticatie aanwezig              | ✅ | /api/auth/register en /api/auth/login |
| 5  | Security                 | Geen conflicterende security rules                               | ✅ | Duidelijke security configuratie |
| 6  | Profielen                | Minstens 2 profielen (`dev`/`prod`) met aparte DB                | ✅ | application-dev.properties (H2), application-prod.properties (PostgreSQL) |
| 6  | Profielen                | Correcte profiel-specifieke configuratie                         | ✅ | DDL-auto, datasource per profiel |
| 6  | Profielen                | Gebruik env variabelen voor gevoelige prod-properties            | ✅ | ${SPRING_DATASOURCE_URL}, ${DB_PASSWORD} etc. |
| 7  | Clean code               | Duidelijke package-structuur, betekenisvolle namen               | ✅ | Packages: controller, service, repository, model, dto, security, config |
| 7  | Clean code               | Correcte laag-scheiding (controller, service, repo, model)       | ✅ | Strikte scheiding tussen lagen |
| 7  | Clean code               | Code voldoet aan Java & Spring Boot best practices               | ✅ | Records voor DTO's, constructor injection, proper annotations |

---

## Deel 3: Testcoverage-overzicht

**Test Coverage:**

**Repository Tests**: 4 classes (30 tests)
- CropRepositoryTest (8 tests)
- IngredientRepositoryTest (6 tests)
- RecipeRepositoryTest (10 tests)
- UserRepositoryTest (6 tests)

**Service Tests**: 7 classes (55 tests)
- CategoryServiceTest (3 tests)
- CourseServiceTest (2 tests)
- CropServiceTest (10 tests)
- IngredientServiceTest (6 tests)
- MeasurementServiceTest (2 tests)
- RecipeServiceTest (8 tests)
- UserServiceTest (24 tests)

**Controller Tests**: 7 classes (55 tests)
- CategoryControllerTest (3 tests)
- CourseControllerTest (3 tests)
- CropControllerTest (12 tests)
- IngredientControllerTest (7 tests)
- MeasurementControllerTest (3 tests)
- RecipeControllerTest (13 tests)
- UserControllerTest (14 tests)

**Integration/Security Tests**: 5 classes (9 tests)
- AuthControllerIntegrationTest (1 test)
- AuthIntegrationNegativeTest (2 tests)
- ProtectedEndpointTokenTest (2 tests)
- RegisterPersistsUserTest (1 test)
- SecurityIntegrationTest (3 tests)

**Basic Tests**: 1 class (1 test)
- BackendApplicationTests (1 test - context loads)

**Total**: 142 tests - 100% success rate

---

## ⭐️ Aanbevelingen

### Sterke punten:
1. **Uitstekende testcoverage**: 142 tests met 100% success rate over alle lagen (repository, service, controller, security)
2. **Professionele API documentatie**: Volledige OpenAPI/Swagger configuratie met duidelijke beschrijvingen, examples en security requirements
3. **Moderne architectuur**: Gebruik van Java 25, Spring Boot 3.5.7, records voor DTO's, MapStruct voor mapping, en proper separation of concerns
4. **Robuuste security**: JWT authenticatie met BCrypt password hashing, rolgebaseerde autorisatie en goede security configuratie
5. **Goed gestructureerd domein model**: Complexe relaties (many-to-many, one-to-many, one-to-one) correct geïmplementeerd met proper cascade en orphan removal

### Verbeterpunten:
1. **Security testing uitbreiden**: Meer uitgebreide tests voor verschillende rollen en edge cases in autorisatie (momenteel slechts 9 security tests)
2. **Error handling verfijnen**: Custom exceptions zijn aanwezig maar zouden specifieker kunnen voor verschillende business logic scenarios
3. **Paginatie bij child resources**: User favorite crops/recipes endpoints gebruiken geen paginatie, wat problematisch kan worden bij veel data
4. **DTO validatie**: Sommige update endpoints zouden kunnen profiteren van specifieke validatie regels (bijv. partial updates)
5. **API versioning**: Overwegen om API versioning toe te voegen voor toekomstige backwards compatibility
