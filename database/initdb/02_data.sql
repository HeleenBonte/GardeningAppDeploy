-- PostgreSQL-compatible mock data
-- Converted from H2-style MERGE statements

-- Users
INSERT INTO users (id, user_name, user_email, password, role)
VALUES (1, 'John Doe', 'john.doe@example.com', '$2a$10$xjLvyI79IUoVCLRg3HCKQeunLoHuHwLuxzfb7sMSDqhMjbY1K.HKa', 'ADMIN')
ON CONFLICT (id) DO UPDATE SET user_name = EXCLUDED.user_name, user_email = EXCLUDED.user_email, password = EXCLUDED.password, role = EXCLUDED.role;

INSERT INTO users (id, user_name, user_email, password, role)
VALUES (2, 'Jane Doe', 'jane.doe@example.com', '$2a$10$1GnYCi0lFag6uvl1JMSueeZFXcz9/jGvikv4z17Y8CLTm9H0RnXwe', 'USER')
ON CONFLICT (id) DO UPDATE SET user_name = EXCLUDED.user_name, user_email = EXCLUDED.user_email, password = EXCLUDED.password, role = EXCLUDED.role;

INSERT INTO users (id, user_name, user_email, password, role)
VALUES (3, 'Someone Else', 'someone.else@example.com', '$2a$10$G3HGY6GSvA8OLMxxI1ttpukiM/9bm0a1X10nUnD8DXAy390Bec7Gi', 'USER')
ON CONFLICT (id) DO UPDATE SET user_name = EXCLUDED.user_name, user_email = EXCLUDED.user_email, password = EXCLUDED.password, role = EXCLUDED.role;

-- Crops
INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (1, 'Tomato', 3, 4, 4, 6, 7, 9, TRUE, TRUE, TRUE, FALSE, 'A popular summer crop', 'Keep warm and provide support','https://images.unsplash.com/photo-1607305387299-a3d9611cd469?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (2, 'Basil', 4, 5, 5, 6, 7, 9, TRUE, TRUE, TRUE, FALSE, 'Aromatic herb', 'Pinch regularly to encourage growth','https://images.unsplash.com/photo-1651773485326-41b9ae7d3c05?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (3, 'Carrot', 2, 4, 3, 5, 7, 10, FALSE, FALSE, TRUE, FALSE, 'Root vegetable', 'Thin seedlings for proper growth','https://images.unsplash.com/photo-1582515073490-39981397c445?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

-- Categories
INSERT INTO categories (id, category_name) VALUES (1, 'Vegan') ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;
INSERT INTO categories (id, category_name) VALUES (2, 'Vegetarian') ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;
INSERT INTO categories (id, category_name) VALUES (3, 'Meat') ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;
INSERT INTO categories (id, category_name) VALUES (4, 'Poultry') ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;
INSERT INTO categories (id, category_name) VALUES (5, 'Seafood') ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;
INSERT INTO categories (id, category_name) VALUES (6, 'Dairy') ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;
INSERT INTO categories (id, category_name) VALUES (7, 'Gluten-Free') ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;
INSERT INTO categories (id, category_name) VALUES (8, 'Fish') ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;

-- Courses
INSERT INTO courses (id, course_name) VALUES (1, 'Main') ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;
INSERT INTO courses (id, course_name) VALUES (2, 'Starter') ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;
INSERT INTO courses (id, course_name) VALUES (3, 'Breakfast') ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;
INSERT INTO courses (id, course_name) VALUES (4, 'Lunch') ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;
INSERT INTO courses (id, course_name) VALUES (5, 'Dinner') ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;
INSERT INTO courses (id, course_name) VALUES (6, 'Snack') ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;
INSERT INTO courses (id, course_name) VALUES (7, 'Dessert') ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;
INSERT INTO courses (id, course_name) VALUES (8, 'Other') ON CONFLICT (id) DO UPDATE SET course_name = EXCLUDED.course_name;

-- Ingredient measurements
INSERT INTO ingredient_measurements (id, measurement_name) VALUES (1, 'grams') ON CONFLICT (id) DO UPDATE SET measurement_name = EXCLUDED.measurement_name;
INSERT INTO ingredient_measurements (id, measurement_name) VALUES (2, 'milliliters') ON CONFLICT (id) DO UPDATE SET measurement_name = EXCLUDED.measurement_name;
INSERT INTO ingredient_measurements (id, measurement_name) VALUES (3, 'pieces') ON CONFLICT (id) DO UPDATE SET measurement_name = EXCLUDED.measurement_name;
INSERT INTO ingredient_measurements (id, measurement_name) VALUES (4, 'tbsp') ON CONFLICT (id) DO UPDATE SET measurement_name = EXCLUDED.measurement_name;
INSERT INTO ingredient_measurements (id, measurement_name) VALUES (5, 'tsp') ON CONFLICT (id) DO UPDATE SET measurement_name = EXCLUDED.measurement_name;

-- Ingredients
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (1, 'Tomato', 1) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (2, 'Basil', 2) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (3, 'Carrot', 3) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (4, 'Flour', NULL) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;

-- Recipes
INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (1, 'Tomato Basil Salad', 1, 'Fresh salad with tomatoes and basil', '10 min', '0 min', 'https://images.unsplash.com/photo-1622637103261-ae624e188bd0?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 2, 1)
ON CONFLICT (id) DO UPDATE SET recipe_name = EXCLUDED.recipe_name, author = EXCLUDED.author, recipe_description = EXCLUDED.recipe_description, prep_time = EXCLUDED.prep_time, cook_time = EXCLUDED.cook_time, image = EXCLUDED.image, course_id = EXCLUDED.course_id, category_id = EXCLUDED.category_id;

INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (2, 'Carrot Soup', 2, 'Warm carrot soup', '20 min', '30 min', 'https://images.unsplash.com/photo-1666083580269-6f409e1765d8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1, 2)
ON CONFLICT (id) DO UPDATE SET recipe_name = EXCLUDED.recipe_name, author = EXCLUDED.author, recipe_description = EXCLUDED.recipe_description, prep_time = EXCLUDED.prep_time, cook_time = EXCLUDED.cook_time, image = EXCLUDED.image, course_id = EXCLUDED.course_id, category_id = EXCLUDED.category_id;

-- Recipe quantities
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (1, 1, 1, 3, 3.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (2, 1, 2, 1, 5.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (3, 2, 3, 1, 300.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (4, 2, 4, 1, 150.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;

-- Recipe steps
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (1, 1, 'Wash and slice the tomatoes.', 1) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (2, 2, 'Chop basil and mix with tomatoes. Season to taste.', 1) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (3, 1, 'Peel and chop carrots.', 2) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (4, 2, 'Boil carrots until tender and blend.', 2) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;

-- User favorite crops
INSERT INTO user_crops (crop_id, user_id)
SELECT 1,1 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=1 AND user_id=1);
INSERT INTO user_crops (crop_id, user_id)
SELECT 2,1 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=2 AND user_id=1);
INSERT INTO user_crops (crop_id, user_id)
SELECT 3,2 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=3 AND user_id=2);

-- User favorite recipes
INSERT INTO user_recipes (recipe_id, user_id)
SELECT 1,1 WHERE NOT EXISTS (SELECT 1 FROM user_recipes WHERE recipe_id=1 AND user_id=1);
INSERT INTO user_recipes (recipe_id, user_id)
SELECT 2,2 WHERE NOT EXISTS (SELECT 1 FROM user_recipes WHERE recipe_id=2 AND user_id=2);

-- Ensure sequences are set to the max(id) to avoid collisions when identity is used
SELECT setval(pg_get_serial_sequence('users','id'), COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('crops','id'), COALESCE((SELECT MAX(id) FROM crops), 1));
SELECT setval(pg_get_serial_sequence('categories','id'), COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval(pg_get_serial_sequence('courses','id'), COALESCE((SELECT MAX(id) FROM courses), 1));
SELECT setval(pg_get_serial_sequence('ingredient_measurements','id'), COALESCE((SELECT MAX(id) FROM ingredient_measurements), 1));
SELECT setval(pg_get_serial_sequence('ingredients','id'), COALESCE((SELECT MAX(id) FROM ingredients), 1));
SELECT setval(pg_get_serial_sequence('recipes','id'), COALESCE((SELECT MAX(id) FROM recipes), 1));
SELECT setval(pg_get_serial_sequence('recipe_quantities','id'), COALESCE((SELECT MAX(id) FROM recipe_quantities), 1));
SELECT setval(pg_get_serial_sequence('recipe_steps','id'), COALESCE((SELECT MAX(id) FROM recipe_steps), 1));

-- End of data
-- copy your data.sql (mock data) contents from backend resources here
