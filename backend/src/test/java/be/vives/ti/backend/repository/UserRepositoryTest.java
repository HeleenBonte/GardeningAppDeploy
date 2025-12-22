package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;


import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
@DataJpaTest
@Import({be.vives.ti.backend.config.JpaConfig.class, be.vives.ti.backend.config.AuditorAwareImpl.class})  // Enable JPA Auditing and provide auditor
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User createTestUser(String userName, String email) {
        User user = new User();
        user.setUserName(userName);
        user.setEmail(email);
        user.setPassword("password123");
        return user;
    }

    @Test
    void findByEmail_whenExists_shouldReturnUser() {
        // Arrange
        User user = createTestUser("John","email");
        entityManager.persist(user);
        entityManager.flush();
        // Act
        Optional<User> found = userRepository.findByEmail("email");
        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("email");
    }

    @Test
    void findByEmail_whenNotExists_shouldReturnEmpty() {
        // Act
        Optional<User> found = userRepository.findByEmail("email");
        // Assert
        assertThat(found).isEmpty();
    }

    @Test
    void findById_whenExists_shouldReturnUser() {
        // Arrange
        User user = createTestUser("John","email");
        User savedUser = entityManager.persistAndFlush(user);
        // Act
        Optional<User> found = userRepository.findById(savedUser.getId());
        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getUserName()).isEqualTo("John");
    }

    @Test
    void findById_whenNotExists_shouldReturnEmpty() {
        // Act
        Optional<User> found = userRepository.findById(999);
        // Assert
        assertThat(found).isEmpty();
    }

    @Test
    void save_NewUser_PersistsUser() {
        // Given
        User user = createTestUser("John", "email");
        // When
        User saved = userRepository.save(user);
        // Then
        Optional<User> found = userRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getUserName()).isEqualTo("John");
    }

    @Test
    void delete_ExistingUser_RemovesFromDatabase() {
        // Given
        User user = createTestUser("John", "email");
        User savedUser = entityManager.persistAndFlush(user);
        // When
        userRepository.deleteById(savedUser.getId());
        entityManager.flush();
        // Then
        Optional<User> result = userRepository.findById(savedUser.getId());
        assertThat(result).isEmpty();
    }
}
