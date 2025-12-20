package be.vives.ti.backend.model;


import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User extends BaseEntity{
    @Column(name = "user_name", length = 100, nullable = false)
    private String userName;

    @Column(name = "user_email", nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;

        @ManyToMany
        @JoinTable(name = "user_crops",
            joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "crop_id", referencedColumnName = "id"))
        private Set<Crop> favoriteCrops;

        @ManyToMany
        @JoinTable(name = "user_recipes",
            joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "recipe_id", referencedColumnName = "id"))
        private Set<Recipe> favoriteRecipes;

    @OneToMany(mappedBy = "author")
    private Set<Recipe> ownRecipes;

    public User(){

    }



    public User(String userName, String email, Role role){
        this.userName = userName;
        this.email = email;
        this.favoriteCrops = new HashSet<>();
        this.favoriteRecipes = new HashSet<>();
        this.ownRecipes = new HashSet<>();
        this.role = role;
    }

    public String getUserName(){
        return this.userName;
    }

    public String getEmail(){
        return this.email;
    }

    public Role getRole(){
        return this.role;
    }

    public String getPassword() {
        return password;
    }

    public Set<Crop> getFavoriteCrops(){
        if(this.favoriteCrops == null){
            this.favoriteCrops = new HashSet<>();
        }
        return this.favoriteCrops;
    }

    public Set<Recipe> getFavoriteRecipes(){
        if(this.favoriteRecipes == null){
            this.favoriteRecipes = new HashSet<>();
        }
        return this.favoriteRecipes;
    }

    public void addFavoriteRecipe(Recipe recipe){
        getFavoriteRecipes().add(recipe);
    }

    public void clearFavoriteRecipes(){
        getFavoriteRecipes().clear();
    }

    public void removeFavoriteRecipe(Recipe recipe){
        getFavoriteRecipes().remove(recipe);
    }
    public void addFavoriteCrop(Crop crop){
        getFavoriteCrops().add(crop);
    }

    public void clearFavoriteCrops(){
        getFavoriteCrops().clear();
    }

    public void removeFavoriteCrop(Crop crop){
        getFavoriteCrops().remove(crop);
    }

    public Set<Recipe> getOwnRecipes() {
        if(this.ownRecipes == null){
            this.ownRecipes = new HashSet<>();
        }
        return ownRecipes;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setEmail(String userEmail) {
        this.email = userEmail;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void addOwnRecipes(Recipe recipe){
        getOwnRecipes().add(recipe);
    }

    public void clearOwnRecipes(){
        getOwnRecipes().clear();
    }

    public void removeOwnRecipe(Recipe recipe){
        getOwnRecipes().remove(recipe);
    }
}
