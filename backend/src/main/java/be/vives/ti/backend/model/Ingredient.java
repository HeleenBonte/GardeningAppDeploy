package be.vives.ti.backend.model;


import jakarta.annotation.Nonnull;
import jakarta.persistence.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ingredients")
public class Ingredient extends BaseEntity{
    @Column(name = "ingredientName")
    private String name;

    @OneToOne
    @JoinColumn(name = "cropID", nullable = true)
    private Crop crop;

//    @ManyToMany
//    @JoinTable(name = "RecipeQuantity", joinColumns = @JoinColumn(name = "recipeID"),
//            inverseJoinColumns = @JoinColumn(name = "ingredientID"))
//    private Set<Recipe> recipes;

    @OneToMany
    @JoinColumn(name = "recipeQuantityID")
    private Set<RecipeQuantity> quantities;

    public Ingredient() {
    }

    public Ingredient(String name) {
        this.name = name;
        this.quantities = new HashSet<>();
    }

    public Ingredient(String name, Crop crop) {
        this.name = name;
        this.crop = crop;
        this.quantities = new HashSet<>();
    }

    public String getName() {
        return name;
    }

    public Crop getCrop() {
        return crop;
    }

    public Set<RecipeQuantity> getQuantities(){
        if(this.quantities == null){
            this.quantities = new HashSet<>();
        }
        return quantities;
    }
}
