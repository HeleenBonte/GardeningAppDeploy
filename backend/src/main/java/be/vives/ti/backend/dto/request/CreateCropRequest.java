package be.vives.ti.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Month;

public record CreateCropRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @NotNull(message = "sowingStart is required")
        Month sowingStart,

        @NotNull(message = "sowingEnd is required")
        Month sowingEnd,

        @NotNull(message = "plantingStart is required")
        Month plantingStart,

        @NotNull(message = "plantingEnd is required")
        Month plantingEnd,

        @NotNull(message = "harvestStart is required")
        Month harvestStart,

        @NotNull(message = "harvestEnd is required")
        Month harvestEnd,

        @NotNull(message = "inHouse is required")
        Boolean inHouse,

        @NotNull(message = "inPots is required")
        Boolean inPots,

        @NotNull(message = "inGarden is required")
        Boolean inGarden,

        @NotNull(message = "inGreenhouse is required")
        Boolean inGreenhouse,

        @NotBlank(message = "Description is required")
        String cropDescription,

        String cropTips,

        String image
) {
}
