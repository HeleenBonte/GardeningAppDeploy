package be.vives.ti.backend.model;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;

@Entity
@Table(name = "recipeSteps")
public class RecipeStep extends BaseEntity{
    @Column(name = "stepNumber")
    private Integer stepNumber;

    @Column(name = "stepDescription")
    private String description;

    @ManyToOne
    @JoinColumn(name = "recipeID")
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
}
