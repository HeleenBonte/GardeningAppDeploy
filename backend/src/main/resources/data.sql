-- Mock data for development
-- Matches tables defined in schema.sql

-- Users
-- Users (idempotent: use MERGE so repeated runs won't fail)
MERGE INTO users (id, user_name, user_email, password, role) KEY(id) VALUES (1, 'John Doe', 'john.doe@example.com', '$2a$10$xjLvyI79IUoVCLRg3HCKQeunLoHuHwLuxzfb7sMSDqhMjbY1K.HKa', 'ADMIN');
MERGE INTO users (id, user_name, user_email, password, role) KEY(id) VALUES (2, 'Jane Doe', 'jane.doe@example.com', '$2a$10$1GnYCi0lFag6uvl1JMSueeZFXcz9/jGvikv4z17Y8CLTm9H0RnXwe', 'USER');
MERGE INTO users (id, user_name, user_email, password, role) KEY(id) VALUES (3, 'Someone Else', 'someone.else@example.com', '$2a$10$G3HGY6GSvA8OLMxxI1ttpukiM/9bm0a1X10nUnD8DXAy390Bec7Gi', 'USER');

-- Crops
-- Crops
MERGE INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips) KEY(id) VALUES (1, 'Tomato', 3, 4, 4, 6, 7, 9, TRUE, TRUE, TRUE, FALSE, 'A popular summer crop', 'Keep warm and provide support');
MERGE INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips) KEY(id) VALUES (2, 'Basil', 4, 5, 5, 6, 7, 9, TRUE, TRUE, TRUE, FALSE, 'Aromatic herb', 'Pinch regularly to encourage growth');
MERGE INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips) KEY(id) VALUES (3, 'Carrot', 2, 4, 3, 5, 7, 10, FALSE, FALSE, TRUE, FALSE, 'Root vegetable', 'Thin seedlings for proper growth');

-- Categories
-- Categories
MERGE INTO categories (id, category_name) KEY(id) VALUES (1, '10');
MERGE INTO categories (id, category_name) KEY(id) VALUES (2, '20');

-- Courses
-- Courses
MERGE INTO courses (id, course_name) KEY(id) VALUES (1, 'Main');
MERGE INTO courses (id, course_name) KEY(id) VALUES (2, 'Starter');

-- Ingredient measurements
-- Ingredient measurements
MERGE INTO ingredient_measurements (id, measurement_name) KEY(id) VALUES (1, 'grams');
MERGE INTO ingredient_measurements (id, measurement_name) KEY(id) VALUES (2, 'cups');
MERGE INTO ingredient_measurements (id, measurement_name) KEY(id) VALUES (3, 'pieces');

-- Ingredients
-- Ingredients
MERGE INTO ingredients (id, ingredient_name, crop_id) KEY(id) VALUES (1, 'Tomato', 1);
MERGE INTO ingredients (id, ingredient_name, crop_id) KEY(id) VALUES (2, 'Basil', 2);
MERGE INTO ingredients (id, ingredient_name, crop_id) KEY(id) VALUES (3, 'Carrot', 3);
MERGE INTO ingredients (id, ingredient_name, crop_id) KEY(id) VALUES (4, 'Flour', NULL);

-- Recipes
-- Recipes
MERGE INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id) KEY(id) VALUES (1, 'Tomato Basil Salad', 1, 'Fresh salad with tomatoes and basil', '10 min', '0 min', NULL, 2, 1);
MERGE INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id) KEY(id) VALUES (2, 'Carrot Soup', 2, 'Warm carrot soup', '20 min', '30 min', NULL, 1, 2);

-- Recipe quantities
-- Recipe quantities
MERGE INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) KEY(id) VALUES (1, 1, 1, 3, 3.0);
MERGE INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) KEY(id) VALUES (2, 1, 2, 1, 5.0);
MERGE INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) KEY(id) VALUES (3, 2, 3, 1, 300.0);
MERGE INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) KEY(id) VALUES (4, 2, 4, 1, 150.0);

-- Recipe steps
-- Recipe steps
MERGE INTO recipe_steps (id, step_number, step_description, recipe_id) KEY(id) VALUES (1, 1, 'Wash and slice the tomatoes.', 1);
MERGE INTO recipe_steps (id, step_number, step_description, recipe_id) KEY(id) VALUES (2, 2, 'Chop basil and mix with tomatoes. Season to taste.', 1);
MERGE INTO recipe_steps (id, step_number, step_description, recipe_id) KEY(id) VALUES (3, 1, 'Peel and chop carrots.', 2);
MERGE INTO recipe_steps (id, step_number, step_description, recipe_id) KEY(id) VALUES (4, 2, 'Boil carrots until tender and blend.', 2);

-- User favorite crops (user_crops)
-- User favorite crops (user_crops) - insert only if not exists
INSERT INTO user_crops (crop_id, user_id)
SELECT 1,1 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=1 AND user_id=1);
INSERT INTO user_crops (crop_id, user_id)
SELECT 2,1 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=2 AND user_id=1);
INSERT INTO user_crops (crop_id, user_id)
SELECT 3,2 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=3 AND user_id=2);

-- User favorite recipes (user_recipes)
-- User favorite recipes (user_recipes) - insert only if not exists
INSERT INTO user_recipes (recipe_id, user_id)
SELECT 1,1 WHERE NOT EXISTS (SELECT 1 FROM user_recipes WHERE recipe_id=1 AND user_id=1);
INSERT INTO user_recipes (recipe_id, user_id)
SELECT 2,2 WHERE NOT EXISTS (SELECT 1 FROM user_recipes WHERE recipe_id=2 AND user_id=2);

-- End of mock data

-- Ensure identity columns restart after explicit-id inserts to avoid PK collisions
-- H2: restart identity to max(id)+1 for each table we seeded with explicit ids
ALTER TABLE users ALTER COLUMN id RESTART WITH 4;
ALTER TABLE crops ALTER COLUMN id RESTART WITH 4;
ALTER TABLE categories ALTER COLUMN id RESTART WITH 3;
ALTER TABLE courses ALTER COLUMN id RESTART WITH 3;
ALTER TABLE ingredient_measurements ALTER COLUMN id RESTART WITH 4;
ALTER TABLE ingredients ALTER COLUMN id RESTART WITH 5;
ALTER TABLE recipes ALTER COLUMN id RESTART WITH 3;
ALTER TABLE recipe_quantities ALTER COLUMN id RESTART WITH 5;
ALTER TABLE recipe_steps ALTER COLUMN id RESTART WITH 5;
