package be.vives.ti.backend.model;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;

@Entity
@Table(name = "recipeQuantities")
public class RecipeQuantity extends BaseEntity{
    @ManyToOne
    @JoinColumn(name = "recipeID")
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "ingredientID")
    private Ingredient ingredient;

    @ManyToOne
    @JoinColumn(name = "measurementID")
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
}
