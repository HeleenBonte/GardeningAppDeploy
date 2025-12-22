// java
package be.vives.ti.backend.repository;

import be.vives.ti.backend.model.Crop;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import({be.vives.ti.backend.config.JpaConfig.class, be.vives.ti.backend.config.AuditorAwareImpl.class})  // Enable JPA Auditing and provide auditor
class CropRepositoryTest {

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByNameContainingIgnoreCase_returnsMatchingCrops() {
        // given
        Crop c1 = new Crop();
        c1.setName("Apple");
        Crop c2 = new Crop();
        c2.setName("Pineapple");
        entityManager.persistAndFlush(c1);
        entityManager.persistAndFlush(c2);

        // when
        Page<Crop> result = cropRepository.findByNameContainingIgnoreCase("app", PageRequest.of(0, 10));

        // then
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).extracting(Crop::getName)
                .containsExactlyInAnyOrder("Apple", "Pineapple");
    }

    @Test
    void findByNameContainingIgnoreCase_noMatches_returnsEmptyPage() {
        // given
        Crop c = new Crop();
        c.setName("Lettuce");
        entityManager.persistAndFlush(c);

        // when
        Page<Crop> result = cropRepository.findByNameContainingIgnoreCase("banana", PageRequest.of(0, 10));

        // then
        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isZero();
        assertThat(result.getContent()).isEmpty();
    }

    @Test
    void findByNameIgnoreCase_returnsOptionalWhenFound() {
        // given
        Crop c = new Crop();
        c.setName("Carrot");
        entityManager.persistAndFlush(c);

        // when
        Optional<Crop> found = cropRepository.findByNameIgnoreCase("carrot");

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Carrot");
    }

    @Test
    void findByNameIgnoreCase_notFound_returnsEmptyOptional() {
        // given
        Crop c = new Crop();
        c.setName("Tomato");
        entityManager.persistAndFlush(c);

        // when
        Optional<Crop> found = cropRepository.findByNameIgnoreCase("potato");

        // then
        assertThat(found).isNotPresent();
    }

    @Test
    void save_NewCrop_GeneratesId() {
        // Given
        Crop crop = new Crop();
        crop.setName("Test Crop");

        // When
        Crop saved = cropRepository.save(crop);

        // Then
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getId()).isPositive();
    }

    @Test
    void delete_ExistingCrop_RemovesFromDatabase() {
        // Given
        Crop crop = entityManager.persistAndFlush(new Crop("To Delete"));
        Integer id = crop.getId();

        // When
        cropRepository.deleteById(id);
        entityManager.flush();

        // Then
        Optional<Crop> result = cropRepository.findById(id);
        assertThat(result).isEmpty();
    }

    @Test
    void findById_existingId_returnsCrop() {
        Crop crop = new Crop("Wheat");
        Crop saved = entityManager.persistAndFlush(crop);

        Optional<Crop> found = cropRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Wheat");
    }

    @Test
    void findById_nonExistingId_returnsEmpty() {
        Optional<Crop> found = cropRepository.findById(9999);

        assertThat(found).isNotPresent();
    }
}