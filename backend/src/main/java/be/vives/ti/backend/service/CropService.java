package be.vives.ti.backend.service;


import be.vives.ti.backend.dto.request.CreateCropRequest;
import be.vives.ti.backend.dto.request.UpdateCropRequest;
import be.vives.ti.backend.exceptions.CropException;
import be.vives.ti.backend.mapper.CropMapper;
import be.vives.ti.backend.model.Crop;
import be.vives.ti.backend.repository.CropRepository;
import be.vives.ti.backend.dto.response.CropResponse;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

import java.util.Optional;

@Service
@Transactional
public class CropService {
    private static final Logger log = LoggerFactory.getLogger(CropService.class);
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

    public CropResponse findById(int id){
        Crop crop = cropRepository.findById(id).orElseThrow();
        return cropMapper.toResponse(crop);
    }

    public Page<CropResponse> findByNameContaining(String name, Pageable pageable){
        Page<Crop> cropPage = cropRepository.findByNameContainingIgnoreCase(name, pageable);
        return cropPage.map(cropMapper::toResponse);
    }

    public CropResponse create(CreateCropRequest request){
        log.debug("Checking if crop name is already used");
        Optional<Crop> cropExists = cropRepository.findByNameContainingIgnoreCase(request.name(), Pageable.unpaged())
                .stream()
                .filter(crop -> crop.getName().equalsIgnoreCase(request.name()))
                .findFirst();
        if(cropExists.isPresent()){
            throw new CropException("Crop name already in use");
        }
        log.debug("Creating new crop: {}", request.name());
        Crop crop = cropMapper.toEntity(request);

        Crop savedCrop = cropRepository.save(crop);
        return cropMapper.toResponse(savedCrop);
    }

    public Optional<CropResponse> update(int id, UpdateCropRequest request){
        log.debug("Updating crop: {}", request.name());
        return cropRepository.findById(id)
                .map(crop -> {
                    cropMapper.updateEntity(request, crop);
                    Crop updatedCrop = cropRepository.save(crop);
                    return cropMapper.toResponse(updatedCrop);
                });

    }

    public
}
