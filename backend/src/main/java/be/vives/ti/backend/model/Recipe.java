package be.vives.ti.backend.model;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "recipes")
public class Recipe extends BaseEntity{
    @Column(name = "recipe_name")
    private String recipeName;

    @ManyToOne
    @JoinColumn(name = "author", nullable = true)
    private User author;

    @Column(name = "recipe_description")
    private String recipeDescription;

    @Column(name =  "prep_time")
    private String prepTime;

    @Column(name = "cook_time")
    private String cookTime;

    @Column(name = "image")
    private String imageURL;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeQuantity> quantities = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeStep> steps = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne
    @JoinColumn(name = "category_id")
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
        this.quantities = new ArrayList<>();
        this.steps = new ArrayList<>();
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
        this.quantities = new ArrayList<>();
        this.steps = new ArrayList<>();
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

    public Integer getAuthorId() {
        return author != null ? author.getId() : null;
    }

    public Integer getCourseId(){
        return course.getId();
    }

    public Integer getCategoryId(){
        return category.getId();
    }
    public List<RecipeQuantity> getQuantities(){
        if(this.quantities == null){
            this.quantities = new ArrayList<>();
        }
        return quantities;
    }

    public Set<Ingredient> getIngredients(){
        Set<Ingredient> ingredients = new HashSet<>();
        if(this.quantities == null){
            this.quantities = new ArrayList<>();
        }
        for (RecipeQuantity quantity : quantities) {
            ingredients.add(quantity.getIngredient());
        }
        return ingredients;
    }
    public void setQuantities(List<RecipeQuantity> quantities) {
        this.quantities = quantities;
    }

    public void setSteps(List<RecipeStep> steps) {
        this.steps = steps;
    }

    public List<RecipeStep> getSteps() {
        if(this.steps == null){
            this.steps = new ArrayList<>();
        }
        return steps;
    }
    @Override
    public String toString(){
        return this.getRecipeName();
    }
}
