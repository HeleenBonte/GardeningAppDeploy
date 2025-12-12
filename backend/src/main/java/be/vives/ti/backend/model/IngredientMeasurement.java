package be.vives.ti.backend.model;


import jakarta.persistence.*;

@Entity
@Table(name = "ingredient_measurements")
public class IngredientMeasurement extends BaseEntity{
    @Column(name = "measurement_name")
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
