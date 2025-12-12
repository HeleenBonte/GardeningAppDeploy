package be.vives.ti.backend.model;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;

@Entity
@Table(name = "recipe_quantities")
public class RecipeQuantity extends BaseEntity{
    @ManyToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @ManyToOne
    @JoinColumn(name = "measurement_id")
    private IngredientMeasurement measurement;

    @Column(name = "quantity")
    private Double quantity;

    public RecipeQuantity() {
    }

    public RecipeQuantity(Recipe recipe, Ingredient ingredient, IngredientMeasurement measurement, Double quantity) {
        this.recipe = recipe;
        this.ingredient = ingredient;
        this.measurement = measurement;
        this.quantity = quantity;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public IngredientMeasurement getMeasurement() {
        return measurement;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public void setIngredient(Ingredient ingredient) {
        this.ingredient = ingredient;
    }

    public void setMeasurement(IngredientMeasurement measurement) {
        this.measurement = measurement;
    }
}
