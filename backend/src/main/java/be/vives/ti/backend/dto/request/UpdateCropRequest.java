package be.vives.ti.backend.dto.request;

import java.time.Month;

public record UpdateCropRequest (
        String name,
        Month sowingStart,
        Month sowingEnd,
        Month plantingStart,
        Month plantingEnd,
        Month harvestStart,
        Month harvestEnd,
        Boolean inHouse,
        Boolean inPots,
        Boolean inGarden,
        Boolean inGreenhouse,
        String cropDescription,
        String cropTips,
        String image
        ){}