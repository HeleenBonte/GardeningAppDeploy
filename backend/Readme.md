Models/Tables:
3 main models:
   * User 
   * Crop
   * Recipe

Recipe contains more data in other tables:
   * Course => a set list of courses (e.g. Dinner, Breakfast, Dessert) each recipe can have one course (many to one [R=>C])
   * Category => a set list of categories (e.g. Vegan, Meat, Dairy) each recipe can have one (main) category (it will obviously seem possible to have more than one category, but for simplicity, for now only one category is allowed) (many to one [R=>C])
   * RecipeQuantity => each recipe will be made up of several RecipeQuantities, these define which ingredients are used in each recipe, in what quantity and which measurement is used. (one to many [R=>C])
   * RecipeStep => the steps explain how the recipe is made, these steps will each get a number to indicate the order in which to make the recipe (one to many [R=>C])

RecipeQuantity links the recipe with other tables:
   * Ingredient => which ingredients are used in the recipe (many to one [R=>I])
   * IngredientMeasurement => which type of measurement is used (e.g. grams, milliliters, spoons,...), this will eventually be a set list (many to one[R=>IM])

There is a link between Ingredient and Crop, each crop will get an ingredientID, so it can be used in the recipes, but not each Ingredient will be a crop (one to zero-or-one [I=>C])

There is a link between User and Crop, where the user can save favorites (many to many)

There is a link between User and Recipe, where the user can save favorites (many to many)

There is another link between User and Recipe, to save the author of the recipe, this can be done anonymous, where no author is given (many to one [R=>U])


images: https://unsplash.com/