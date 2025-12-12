package be.vives.ti.backend.model;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;

@Entity
@Table(name = "recipe_steps")
public class RecipeStep extends BaseEntity{
    @Column(name = "step_number")
    private Integer stepNumber;

    @Column(name = "step_description")
    private String description;

    @ManyToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    public RecipeStep() {
    }

    public RecipeStep(Integer stepNumber, String description, Recipe recipe) {
        this.stepNumber = stepNumber;
        this.description = description;
        this.recipe = recipe;
    }

    public Integer getStepNumber() {
        return stepNumber;
    }

    public String getDescription() {
        return description;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setStepNumber(Integer stepNumber) {
        this.stepNumber = stepNumber;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }
}
