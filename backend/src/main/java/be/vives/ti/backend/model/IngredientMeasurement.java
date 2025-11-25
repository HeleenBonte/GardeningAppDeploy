package be.vives.ti.backend.model;


import jakarta.persistence.*;

@Entity
public class IngredientMeasurement extends BaseEntity{
    @Column(name = "ingredientMeasurementName")
    private String name;

    public IngredientMeasurement() {
    }

    public IngredientMeasurement(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

}
