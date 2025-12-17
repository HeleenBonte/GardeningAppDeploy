package be.vives.ti.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Month;

public record CreateCropRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "sowingStart is required")
        Month sowingStart,

        @NotBlank(message = "sowingEnd is required")
        Month sowingEnd,

        @NotBlank(message = "plantingStart is required")
        Month plantingStart,

        @NotBlank(message = "plantingEnd is required")
        Month plantingEnd,

        @NotBlank(message = "harvestingStart is required")
        Month harvestingStart,

        @NotBlank(message = "harvestingEnd is required")
        Month harvestingEnd,

        @NotBlank(message = "inHouse is required")
        Boolean inHouse,

        @NotBlank(message = "inPots is required")
        Boolean inPots,

        @NotBlank(message = "inGarden is required")
        Boolean inGarden,

        @NotBlank(message = "inGreenhouse is required")
        Boolean inGreenhouse,

        @NotBlank(message = "Description is required")
        String description,

        String cropTips,

        String image
) {
}
