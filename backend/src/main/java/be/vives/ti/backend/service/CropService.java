package be.vives.ti.backend.service;


import be.vives.ti.backend.mapper.CropMapper;
import be.vives.ti.backend.model.Crop;
import be.vives.ti.backend.repository.CropRepository;
import be.vives.ti.backend.dto.response.CropResponse;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

@Service
@Transactional
public class CropService {
    private final CropRepository cropRepository;
    private final CropMapper cropMapper;
    public CropService(CropRepository cropRepository, CropMapper cropMapper){
        this.cropRepository = cropRepository;
        this.cropMapper = cropMapper;
    }

    public Page<CropResponse> findAll(Pageable pageable){
        Page<Crop> cropPage = cropRepository.findAll(pageable);
        return cropPage.map(cropMapper::toResponse);
    }
}
