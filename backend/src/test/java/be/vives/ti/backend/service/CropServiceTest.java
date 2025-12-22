package be.vives.ti.backend.service;

import be.vives.ti.backend.dto.request.CreateCropRequest;
import be.vives.ti.backend.dto.request.UpdateCropRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.exceptions.CropException;
import be.vives.ti.backend.mapper.CropMapper;
import be.vives.ti.backend.model.Crop;
import be.vives.ti.backend.repository.CropRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Month;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CropServiceTest {

    @Mock
    private CropRepository cropRepository;

    @Mock
    private CropMapper cropMapper;

    @InjectMocks
    private CropService cropService;

    private Crop crop1;
    private Crop crop2;
    private CropResponse resp1;
    private CropResponse resp2;

    @BeforeEach
    void setUp() {
        crop1 = new Crop();
        crop1.setId(1);
        crop1.setName("Carrot");

        crop2 = new Crop();
        crop2.setId(2);
        crop2.setName("Potato");

        resp1 = new CropResponse(1,
                "Carrot",
                null, null, null, null, null, null,
                false, false, false, false,
                null, null, null);
        resp2 = new CropResponse(2,
                "Potato",
                null, null, null, null, null, null,
                false, false, false, false,
                null, null, null);
    }

    @Test
    void findAll_returnsMappedResponses() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Crop> page = new PageImpl<>(List.of(crop1, crop2));

        when(cropRepository.findAll(pageable)).thenReturn(page);
        when(cropMapper.toResponse(crop1)).thenReturn(resp1);
        when(cropMapper.toResponse(crop2)).thenReturn(resp2);

        Page<CropResponse> result = cropService.findAll(pageable);

        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertThat(result.getContent()).containsExactly(resp1, resp2);

        verify(cropRepository).findAll(pageable);
        verify(cropMapper).toResponse(crop1);
        verify(cropMapper).toResponse(crop2);
    }

    @Test
    void findById_returnsMappedResponse() {
        when(cropRepository.findById(1)).thenReturn(Optional.of(crop1));
        when(cropMapper.toResponse(crop1)).thenReturn(resp1);

        CropResponse result = cropService.findById(1);

        assertNotNull(result);
        assertEquals(resp1.id(), result.id());
        assertEquals(resp1.name(), result.name());

        verify(cropRepository).findById(1);
        verify(cropMapper).toResponse(crop1);
    }

    @Test
    void findById_notFound_throwsNoSuchElementException() {
        when(cropRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cropService.findById(99))
                .isInstanceOf(java.util.NoSuchElementException.class);

        verify(cropRepository).findById(99);
        verifyNoInteractions(cropMapper);
    }

    @Test
    void findByNameContaining_returnsMappedResponses() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<Crop> page = new PageImpl<>(List.of(crop1));

        when(cropRepository.findByNameContainingIgnoreCase("car", pageable)).thenReturn(page);
        when(cropMapper.toResponse(crop1)).thenReturn(resp1);

        Page<CropResponse> result = cropService.findByNameContaining("car", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertThat(result.getContent()).containsExactly(resp1);

        verify(cropRepository).findByNameContainingIgnoreCase("car", pageable);
        verify(cropMapper).toResponse(crop1);
    }

    @Test
    void create_success_returnsResponse() {
        CreateCropRequest req = new CreateCropRequest(
                "Cucumber",
                Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.MAY, Month.JUNE,
                true, false, true, false,
                "Some description",
                "tips",
                "image.png"
        );
        Crop toSave = new Crop();
        toSave.setName("Cucumber");

        Crop saved = new Crop();
        saved.setId(10);
        saved.setName("Cucumber");

        CropResponse savedResp = new CropResponse(10,
                "Cucumber",
                null, null, null, null, null, null,
                false, false, false, false,
                null, null, null);

        when(cropRepository.findByNameIgnoreCase("Cucumber")).thenReturn(Optional.empty());
        when(cropMapper.toEntity(req)).thenReturn(toSave);
        when(cropRepository.save(toSave)).thenReturn(saved);
        when(cropMapper.toResponse(saved)).thenReturn(savedResp);

        CropResponse result = cropService.create(req);

        assertNotNull(result);
        assertEquals(10, result.id());
        assertEquals("Cucumber", result.name());

        verify(cropRepository).findByNameIgnoreCase("Cucumber");
        verify(cropMapper).toEntity(req);
        verify(cropRepository).save(toSave);
        verify(cropMapper).toResponse(saved);
    }

    @Test
    void create_nameAlreadyUsed_throwsCropException() {
        CreateCropRequest req = new CreateCropRequest(
                "Carrot",
                Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.MAY, Month.JUNE,
                true, false, true, false,
                "desc",
                "tips",
                "image.png"
        );
        when(cropRepository.findByNameIgnoreCase("Carrot")).thenReturn(Optional.of(crop1));

        assertThatThrownBy(() -> cropService.create(req)).isInstanceOf(CropException.class)
                .hasMessageContaining("Crop name already in use");

        verify(cropRepository).findByNameIgnoreCase("Carrot");
        verifyNoMoreInteractions(cropRepository);
        verifyNoInteractions(cropMapper);
    }

    @Test
    void update_exists_returnsOptionalResponse() {
        UpdateCropRequest req = new UpdateCropRequest(
                "NewName",
                Month.JANUARY, Month.FEBRUARY, Month.MARCH, Month.APRIL, Month.MAY, Month.JUNE,
                true, false, true, false,
                "updated desc",
                "tips",
                "image.png"
        );
        Crop existing = new Crop();
        existing.setId(5);
        existing.setName("OldName");

        Crop updated = new Crop();
        updated.setId(5);
        updated.setName("NewName");

        CropResponse updatedResp = new CropResponse(5,
                "NewName",
                null, null, null, null, null, null,
                false, false, false, false,
                null, null, null);

        when(cropRepository.findById(5)).thenReturn(Optional.of(existing));
        // cropMapper.updateEntity should be called; we don't need it to modify the object for the test
        doAnswer(invocation -> {
            UpdateCropRequest r = invocation.getArgument(0);
            Crop c = invocation.getArgument(1);
            c.setName(r.name());
            return null;
        }).when(cropMapper).updateEntity(eq(req), eq(existing));

        when(cropRepository.save(existing)).thenReturn(updated);
        when(cropMapper.toResponse(updated)).thenReturn(updatedResp);

        Optional<CropResponse> result = cropService.update(5, req);

        assertTrue(result.isPresent());
        assertEquals(5, result.get().id());
        assertEquals("NewName", result.get().name());

        verify(cropRepository).findById(5);
        verify(cropMapper).updateEntity(eq(req), eq(existing));
        verify(cropRepository).save(existing);
        verify(cropMapper).toResponse(updated);
    }

    @Test
    void update_notFound_returnsEmptyOptional() {
        UpdateCropRequest req = new UpdateCropRequest(
                "X",
                null, null, null, null, null, null,
                null, null, null, null,
                "x",
                null,
                null
        );
        when(cropRepository.findById(999)).thenReturn(Optional.empty());

        Optional<CropResponse> result = cropService.update(999, req);

        assertTrue(result.isEmpty());

        verify(cropRepository).findById(999);
        verifyNoInteractions(cropMapper);
    }

    @Test
    void delete_exists_returnsTrue_andDeletes() {
        when(cropRepository.existsById(3)).thenReturn(true);

        boolean deleted = cropService.delete(3);

        assertTrue(deleted);
        verify(cropRepository).existsById(3);
        verify(cropRepository).deleteById(3);
    }

    @Test
    void delete_notFound_returnsFalse_andDoesNotDelete() {
        when(cropRepository.existsById(42)).thenReturn(false);

        boolean deleted = cropService.delete(42);

        assertFalse(deleted);
        verify(cropRepository).existsById(42);
        verify(cropRepository, never()).deleteById(anyInt());
    }
}
