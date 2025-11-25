package be.vives.ti.backend.model;


import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Ingredient extends BaseEntity{
    @Column(name = "ingredientName")
    private String name;

    @Column(name = "caloriesPerQuantity")
    private Integer caloriesPerQuantity;

    @OneToOne
    @JoinColumn(name = "cropID", nullable = true)
    private Crop crop;

    @ManyToMany
    @JoinTable(name = "RecipeQuantity", joinColumns = @JoinColumn(name = "recipeID"),
            inverseJoinColumns = @JoinColumn(name = "ingredientID"))
    private Set<Recipe> recipes;

    public Ingredient() {
    }

    public Ingredient(String name, Integer caloriesPerQuantity) {
        this.name = name;
        this.caloriesPerQuantity = caloriesPerQuantity;
        this.recipes = new HashSet<>();
    }

    public Ingredient(String name, Integer caloriesPerQuantity, Crop crop) {
        this.name = name;
        this.caloriesPerQuantity = caloriesPerQuantity;
        this.crop = crop;
        this.recipes = new HashSet<>();
    }

    public String getName() {
        return name;
    }

    public Integer getCaloriesPerQuantity() {
        return caloriesPerQuantity;
    }

    public Crop getCrop() {
        return crop;
    }

    public Set<Recipe> getRecipes(){
        if(this.recipes == null){
            this.recipes = new HashSet<>();
        }
        return recipes;
    }
}
