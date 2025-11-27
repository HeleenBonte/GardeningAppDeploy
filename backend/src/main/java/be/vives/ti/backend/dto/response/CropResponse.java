package be.vives.ti.backend.dto.response;

import java.time.Month;

public record CropResponse(
        Integer id,
        String name,
        Month sowingStart,
        Month sowingEnd,
        Month plantingStart,
        Month plantingEnd,
        Month harvestingStart,
        Month harvestingEnd,
        Boolean inHouse,
        Boolean inPots,
        Boolean inGarden,
        Boolean inGreenhouse,
        String cropDescription,
        String cropTips

) {
}
