# Zelfevaluatie Java Spring Boot Backend

## Deel 1: Technisch Overzicht

### Applicatie Beschrijving
Deze applicatie is een tuinieren- en recepten-app waarbij gebruikers informatie kunnen beheren over gewassen (crops), recepten en ingrediënten. De applicatie biedt gebruikers de mogelijkheid om favoriete gewassen en recepten op te slaan. Gewassen bevatten details over zaai-, plant- en oogsttijden. Recepten zijn opgebouwd uit ingrediënten (die gekoppeld kunnen zijn aan gewassen), hoeveelheden met bijbehorende metingen, en bereidingsstappen. Gebruikers kunnen recepten toevoegen als auteur. Het systeem ondersteunt rol-gebaseerde toegangscontrole met USER en ADMIN rollen.

### Versies
- **Java versie**: 25
- **Spring Boot versie**: 3.5.7

### Swagger/OpenAPI Documentatie
- **Lokaal (dev)**: http://localhost:8080/swagger-ui.html
- **Productie URL**: Niet beschikbaar (geen deployment gespecificeerd)

### Testgebruikers en Rollen
| Rol   | Email                    | Wachtwoord | Gebruikersnaam |
|-------|--------------------------|------------|----------------|
| ADMIN | john.doe@example.com     | password   | John Doe       |
| USER  | jane.doe@example.com     | password   | Jane Doe       |
| USER  | someone.else@example.com | password   | Someone Else   |

### Database
- **Development**: H2 in-memory database (jdbc:h2:mem:devdb)
- **Productie**: PostgreSQL
- **Setup**: Database schema wordt automatisch aangemaakt via JPA/Hibernate. In development wordt deze gevuld met mock data via `data.sql`. In productie wordt `validate` gebruikt voor DDL auto-configuratie.

### Controllers, Services, Repositories en Entities Overzicht

| Controller           | Service(s)        | Repository/Repositories                                                                              | Entity/Entities                                             |
|----------------------|-------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|
| RecipeController     | RecipeService     | RecipeRepository, CourseRepository, CategoryRepository, RecipeQuantityRepository, RecipeStepRepository | Recipe, Course, Category, RecipeQuantity, RecipeStep, Ingredient, IngredientMeasurement |
| UserController       | UserService       | UserRepository, CropRepository, RecipeRepository                                                     | User, Crop, Recipe                                          |
| CropController       | CropService       | CropRepository                                                                                       | Crop                                                        |
| IngredientController | IngredientService | IngredientRepository, CropRepository                                                                 | Ingredient, Crop                                            |
| AuthController       | -                 | UserRepository                                                                                       | User                                                        |

**Toelichting volgorde**: Controllers zijn gesorteerd van meest naar minst uitgewerkte functionaliteit. RecipeController heeft de meeste endpoints inclusief filtering op category, course en ingredient. UserController heeft uitgebreide functionaliteit voor favorieten-beheer. CropController en IngredientController hebben standaard CRUD plus enkele extra endpoints. AuthController biedt alleen login en registratie.

### Authenticatie
Authenticatie is geïmplementeerd via **JWT (JSON Web Tokens)**:
- Gebruikers kunnen registreren via `/api/auth/register` (krijgen automatisch USER rol)
- Inloggen gebeurt via `/api/auth/login` met email en wachtwoord
- Na succesvolle authenticatie wordt een JWT token teruggegeven
- Dit token moet meegestuurd worden in de `Authorization` header als `Bearer <token>` voor beveiligde endpoints
- Wachtwoorden worden gehashed opgeslagen met BCrypt
- SecurityConfig definieert welke endpoints publiek toegankelijk zijn en welke authenticatie/autorisatie vereisen
- JWT tokens bevatten email en rol informatie en hebben een vervaltijd van 24 uur (86400000ms)

---

## Deel 2: Checklist

| Nr | Categorie                | Vereiste                                                         | ✅/⚠️/❌ | Opmerking/commentaar                                                                                  |
|----|--------------------------|------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------|
| 0  | Algemeen                 | Alle code compileert                                             | ✅        |                                                                                                      |
| 0  | Algemeen                 | Maven build succesvol                                            | ✅        |                                                                                                      |
| 0  | Algemeen                 | Dependency Injection overal correct gebruikt                     | ✅        | Constructor injection consequent toegepast in alle services en controllers                           |
| 0  | Algemeen                 | Java versie is 25 en minstens Spring Boot 3                      | ✅        | Java 25 en Spring Boot 3.5.7                                                                         |
| 1  | Functionele werking      | App start vlot op met dev-profiel                                | ✅        | H2 in-memory database met automatische schema en data initialisatie                                 |
| 1  | Functionele werking      | Alle endpoints functioneren foutloos (CRUD, filtering, security) | ⚠️       | Tests zijn grotendeels leeg (CropControllerTest, RecipeControllerTest, IngredientControllerTest zijn lege klassen) |
| 1  | Functionele werking      | Geen 5xx-fouten bij gebruik                                      | ⚠️       | Niet volledig getest door ontbrekende implementatie van tests                                       |
| 2  | Persistentie             | Entiteiten correct geconfigureerd                                | ✅        | Alle entiteiten extenden BaseEntity met JPA annotaties                                              |
| 2  | Persistentie             | Relaties correct geïmplementeerd                                 | ✅        | OneToMany, ManyToOne, ManyToMany correct gebruikt                                                    |
| 2  | Persistentie             | Geen FetchType.EAGER op veel-relaties                            | ✅        | Geen expliciete EAGER fetching gevonden op @OneToMany of @ManyToMany relaties                       |
| 3  | Testen                   | Unit tests voor controllers aanwezig                             | ⚠️       | Alleen UserController heeft tests (14 tests). Crop, Recipe en Ingredient controller tests zijn leeg |
| 3  | Testen                   | Unit tests voor repository-methodes aanwezig                     | ❌        | Geen repository tests gevonden                                                                       |
| 3  | Testen                   | (Indien van toepassing) Service-lagen getest                     | ❌        | Geen service tests gevonden                                                                          |
| 3  | Testen                   | "Happy flows" voor alle endpoints getest                         | ⚠️       | Alleen voor UserController getest (14 tests)                                                         |
| 3  | Testen                   | Edge cases & foutafhandeling getest                              | ⚠️       | Beperkt getest - alleen 2 error cases in UserControllerTest                                         |
| 3  | Testen                   | Beveiligde endpoints (verschillende rollen) getest               | ⚠️       | SecurityIntegrationTest heeft 2 tests voor USER/ADMIN rollen op /api/users endpoint                 |
| 4  | REST API & documentatie  | Minstens 2 controllers geïmplementeerd                           | ✅        | 5 controllers: Recipe, User, Crop, Ingredient, Auth                                                  |
| 4  | REST API & documentatie  | Minstens 1 controller met volledige CRUD-functionaliteit         | ✅        | RecipeController, CropController en UserController hebben volledige CRUD                             |
| 4  | REST API & documentatie  | Minstens 1 controller met child-records benaderbaar              | ✅        | UserController: /api/users/{id}/favorite-crops en /api/users/{id}/favorite-recipes                   |
| 4  | REST API & documentatie  | Correcte HTTP-methodes en statuscodes gebruikt                   | ✅        | GET (200), POST (201), PUT (200), DELETE (204/200), 404 voor niet gevonden resources                |
| 4  | REST API & documentatie  | Consistente, duidelijke endpoint-structuur                       | ✅        | RESTful structuur: /api/{resource} en /api/{resource}/{id}                                           |
| 4  | REST API & documentatie  | Paginatie aanwezig indien relevant                               | ✅        | Pageable gebruikt in findAll methods met @ParameterObject annotatie                                  |
| 4  | REST API & documentatie  | RESTful URL-patterns gevolgd                                     | ✅        | Consistent gebruik van resource-gebaseerde URLs                                                      |
| 4  | REST API & documentatie  | OpenAPI/Swagger-documentatie volledig & beschikbaar              | ✅        | Swagger UI geconfigureerd op /swagger-ui.html met uitgebreide API docs                               |
| 4  | REST API & documentatie  | Controllers voldoende gedocumenteerd                             | ✅        | @Operation, @ApiResponses en @Parameter annotaties aanwezig                                          |
| 4  | REST API & documentatie  | Schema-documentatie voor request/response DTO's aanw.            | ✅        | @Schema annotaties op DTO's (CreateRecipeRequest, etc.)                                              |
| 4  | REST API & documentatie  | Documentatie toont endpoints met beveiliging/rollen              | ✅        | @SecurityRequirement annotaties op beveiligde endpoints                                              |
| 4  | REST API & documentatie  | Communicatie via DTO's (nooit directe entities)                  | ✅        | Request/Response DTO's gebruikt met MapStruct mappers                                                |
| 4  | REST API & documentatie  | Request DTO's steeds voorzien van validatie                      | ✅        | @NotBlank, @NotNull, @NotEmpty, @DecimalMin validatie annotaties aanwezig                           |
| 4  | REST API & documentatie  | Inkomende data steeds gevalideerd                                | ✅        | @Valid annotatie gebruikt op AuthController endpoints                                                |
| 4  | REST API & documentatie  | Foutafhandeling (error handling) geregeld                        | ✅        | GlobalExceptionHandler met @ControllerAdvice voor centralized exception handling                     |
| 5  | Security                 | Authenticatie en autorisatie correct geïmplementeerd             | ✅        | JWT-based authenticatie met role-based authorization                                                 |
| 5  | Security                 | Minstens twee rollen voorzien                                    | ✅        | USER en ADMIN rollen (enum Role)                                                                     |
| 5  | Security                 | Rolgebaseerde autorisatie aanwezig                               | ✅        | SecurityConfig met hasRole/hasAnyRole checks en @PreAuthorize in controller                          |
| 5  | Security                 | Standaardgebruikers voor beide rollen aanwezig                   | ✅        | In data.sql: 1 ADMIN (john.doe) en 2 USER accounts (jane.doe, someone.else)                         |
| 5  | Security                 | Geen plaintext passwords (alle passwords gehashed)               | ✅        | BCryptPasswordEncoder gebruikt voor password hashing                                                 |
| 5  | Security                 | Endpoint voor registratie en authenticatie aanwezig              | ✅        | /api/auth/register en /api/auth/login                                                                |
| 5  | Security                 | Geen conflicterende security rules                               | ✅        | SecurityConfig heeft duidelijke request matcher hiërarchie                                           |
| 6  | Profielen                | Minstens 2 profielen (`dev`/`prod`) met aparte DB                | ✅        | application-dev.properties (H2) en application-prod.properties (PostgreSQL)                          |
| 6  | Profielen                | Correcte profiel-specifieke configuratie                         | ✅        | DDL auto en datasource correct geconfigureerd per profiel                                            |
| 6  | Profielen                | Gebruik env variabelen voor gevoelige prod-properties            | ✅        | PostgreSQL credentials gebruiken ${ENV_VAR:default} syntax                                           |
| 7  | Clean code               | Duidelijke package-structuur, betekenisvolle namen               | ✅        | Packages: controller, service, repository, model, dto, security, config, exceptions, mapper          |
| 7  | Clean code               | Correcte laag-scheiding (controller, service, repo, model)       | ✅        | Duidelijke scheiding met dependency injection                                                        |
| 7  | Clean code               | Code voldoet aan Java & Spring Boot best practices               | ✅        | Constructor injection, records voor DTO's, MapStruct voor mapping, proper exception handling         |

---

## Deel 3: Testcoverage-overzicht

**Test Coverage:**

**Controller Tests: 1 klasse (14 tests)**
- UserControllerTest (14 tests)
  - getUser_returnsOk
  - getAllUsers_returnsOk
  - createUser_returnsCreated
  - getFavoriteCrops_returnsOk
  - addFavoriteCrop_returnsOk
  - removeFavoriteCrop_returnsNoContent
  - getFavoriteRecipes_returnsOk
  - addFavoriteRecipe_returnsOk
  - removeFavoriteRecipe_returnsNoContent
  - updateUser_returnsOk
  - deleteUser_returnsNoContent
  - getUserById_notFound_returns404
  - createUser_duplicateEmail_returnsServerError

**Integration Tests: 1 klasse (2 tests)**
- SecurityIntegrationTest (2 tests)
  - getAllUsers_asUser_forbidden
  - getAllUsers_asAdmin_ok

**Application Tests: 1 klasse (1 test)**
- BackendApplicationTests (1 test - context loading test)

**Lege test klassen:**
- CropControllerTest (geen tests)
- RecipeControllerTest (geen tests)
- IngredientControllerTest (geen tests)

**Total: 18 tests**

**Opmerking**: De pom.xml bevat `<skipTests>true</skipTests>` en `<testFailureIgnore>true</testFailureIgnore>`, wat aangeeft dat tests momenteel geskipt worden tijdens builds. Er zijn geen repository tests en geen service tests geïmplementeerd.

---

## ⭐️ Aanbevelingen

### Sterke Punten:
1. **Uitstekende API documentatie**: Volledige OpenAPI/Swagger documentatie met gedetailleerde beschrijvingen, parameters en response codes
2. **Goede architectuur**: Duidelijke lagenstructuur met proper separation of concerns, gebruik van DTO's en MapStruct mappers
3. **Veilige authenticatie**: JWT-implementatie met BCrypt password hashing en role-based authorization
4. **Profiel management**: Goede scheiding tussen dev en prod omgevingen met environment variables

### Verbeterpunten:
1. **Tests uitbreiden**: Implementeer tests voor CropController, RecipeController en IngredientController. Voeg repository en service tests toe voor volledige coverage
2. **Test configuratie**: Verwijder `<skipTests>true</skipTests>` uit pom.xml en fix de testFailureIgnore setting zodat tests tijdens builds uitgevoerd worden
3. **Validatie consistentie**: Voeg @Valid annotatie toe op alle controller endpoints die request DTO's accepteren (niet alleen AuthController)
4. **Repository tests**: Voeg JPA repository tests toe voor custom query methods zoals `findByNameContainingIgnoreCase`
5. **Integration testing**: Breid security integration tests uit om alle beveiligde endpoints en rollen te dekken
