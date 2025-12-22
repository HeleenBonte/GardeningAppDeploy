package be.vives.ti.backend.dto.response;

public record IngredientResponse(
        Integer id,
        String name,
        Integer cropId
){ }