package be.vives.ti.backend.model;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "recipes")
public class Recipe extends BaseEntity{
    @Column(name = "recipeName")
    private String recipeName;

    @ManyToOne
    @JoinColumn(name = "author", nullable = true)
    private User author;

    @Column(name = "recipeDescription")
    private String recipeDescription;

    @Column(name =  "prepTime")
    private String prepTime;

    @Column(name = "cookTime")
    private String cookTime;

    @Column(name = "image")
    private String imageURL;

    @OneToMany
    @JoinColumn(name = "recipeQuantityID")
    private Set<RecipeQuantity> quantities;

    @OneToMany
    @JoinColumn(name = "recipeStepID")
    private Set<RecipeStep> steps;

    @ManyToOne
    @JoinColumn(name = "courseID")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "categoryID")
    private Category category;

    public Recipe(){
    }

    public Recipe(String recipeName,
                  String recipeDescription,
                  String prepTime, String cookTime,
                  Course course, Category category){
        this.recipeName = recipeName;
        this.recipeDescription = recipeDescription;
        this.prepTime = prepTime;
        this.cookTime = cookTime;
        this.course = course;
        this.category = category;
        this.quantities = new HashSet<>();
        this.steps = new HashSet<>();
    }

    public Recipe(String recipeName, User author,
                  String recipeDescription,
                  String prepTime, String cookTime,
                  String imageURL,
                  Course course, Category category){
        this.recipeName = recipeName;
        this.author = author;
        this.recipeDescription = recipeDescription;
        this.prepTime = prepTime;
        this.cookTime = cookTime;
        this.imageURL = imageURL;
        this.course = course;
        this.category = category;
        this.quantities = new HashSet<>();
        this.steps = new HashSet<>();
    }

    public String getRecipeName(){
        return recipeName;
    }

    public String getAuthor(){
        return author != null ? author.getUserName() : "This recipe was admitted anonymously";
    }

    public void setRecipeName(String newName){
        this.recipeName = newName;
    }

    public String getRecipeDescription() {
        return recipeDescription;
    }

    public String getPrepTime() {
        return prepTime;
    }

    public String getCookTime() {
        return cookTime;
    }

    public Course getCourse() {
        return course;
    }

    public Category getCategory() {
        return category;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public void setRecipeDescription(String recipeDescription) {
        this.recipeDescription = recipeDescription;
    }

    public void setPrepTime(String prepTime) {
        this.prepTime = prepTime;
    }

    public void setCookTime(String cookTime) {
        this.cookTime = cookTime;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getImageURL() {
        return imageURL;
    }

    public Set<RecipeQuantity> getQuantities(){
        if(this.quantities == null){
            this.quantities = new HashSet<>();
        }
        return quantities;
    }

    public Set<Ingredient> getIngredients(){
        Set<Ingredient> ingredients = new HashSet<>();
        if(this.quantities == null){
            this.quantities = new HashSet<>();
        }
        for (RecipeQuantity quantity : quantities) {
            ingredients.add(quantity.getIngredient());
        }
        return ingredients;
    }
    public void setQuantities(Set<RecipeQuantity> quantities) {
        this.quantities = quantities;
    }

    public void setSteps(Set<RecipeStep> steps) {
        this.steps = steps;
    }

    public Set<RecipeStep> getSteps() {
        if(this.steps == null){
            this.steps = new HashSet<>();
        }
        return steps;
    }
    @Override
    public String toString(){
        return this.getRecipeName();
    }
}
