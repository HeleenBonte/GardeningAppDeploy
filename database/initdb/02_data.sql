-- PostgreSQL-compatible mock data
-- Converted from H2-style MERGE statements

-- Users
INSERT INTO users (id, user_name, user_email, password, role)
VALUES (1, 'John', 'john@example.com', '$2a$10$atQn1RxRouvAn5xb7psu8eTm/OrailL.W3bP0tgpiAy.eFaA5Z0Ze', 'ADMIN')
ON CONFLICT (id) DO UPDATE SET user_name = EXCLUDED.user_name, user_email = EXCLUDED.user_email, password = EXCLUDED.password, role = EXCLUDED.role;

INSERT INTO users (id, user_name, user_email, password, role)
VALUES (2, 'Jane', 'jane@example.com', '$2a$10$WA0ogKIITjyRfQqGbMz/...esyyzhK2Ip/b3dVjeXuHC8Dfl7T/b2', 'USER')
ON CONFLICT (id) DO UPDATE SET user_name = EXCLUDED.user_name, user_email = EXCLUDED.user_email, password = EXCLUDED.password, role = EXCLUDED.role;

-- INSERT INTO users (id, user_name, user_email, password, role)
-- VALUES (3, 'Someone Else', 'someone.else@example.com', '$2a$10$G3HGY6GSvA8OLMxxI1ttpukiM/9bm0a1X10nUnD8DXAy390Bec7Gi', 'USER')
-- ON CONFLICT (id) DO UPDATE SET user_name = EXCLUDED.user_name, user_email = EXCLUDED.user_email, password = EXCLUDED.password, role = EXCLUDED.role;

-- Crops
INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (1, 'Tomato', 3, 4, 4, 6, 7, 9, TRUE, TRUE, TRUE, FALSE, 'A popular summer crop', 'Keep warm and provide support','https://images.unsplash.com/photo-1607305387299-a3d9611cd469?q=80&w=2070&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (2, 'Basil', 4, 5, 5, 6, 7, 9, TRUE, TRUE, TRUE, FALSE, 'Aromatic herb', 'Pinch regularly to encourage growth','https://images.unsplash.com/photo-1651773485326-41b9ae7d3c05?q=80&w=2030&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (3, 'Carrot', 2, 4, 3, 5, 7, 10, FALSE, FALSE, TRUE, FALSE, 'Root vegetable', 'Thin seedlings for proper growth','https://images.unsplash.com/photo-1582515073490-39981397c445?q=80&w=2069&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (4, 'Lettuce', 3, 5, 4, 6, 6, 9, TRUE, TRUE, TRUE, FALSE, 'Leafy green for salads', 'Harvest outer leaves regularly','https://images.unsplash.com/photo-1515356956468-873dd257f911?q=80&w=1974&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (5, 'Spinach', 2, 4, 3, 5, 5, 8, TRUE, TRUE, TRUE, FALSE, 'Cold-tolerant leafy green', 'Keep soil moist for tender leaves','https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?q=80&w=1935&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (6, 'Potato', 3, 4, 4, 5, 9, 11, FALSE, FALSE, TRUE, FALSE, 'Starchy tuber', 'Hill soil around stems to protect tubers','https://images.unsplash.com/photo-1552661397-4233881ea8c8?q=80&w=665&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (7, 'Cucumber', 4, 6, 5, 6, 7, 9, FALSE, TRUE, TRUE, TRUE, 'Vining summer crop', 'Provide a trellis for vertical growth','https://images.unsplash.com/photo-1518568403628-df55701ade9e?q=80&w=2070&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (8, 'Bell Pepper', 3, 5, 4, 6, 7, 10, TRUE, TRUE, TRUE, FALSE, 'Sweet pepper varieties', 'Keep soil warm and avoid overwatering','https://images.unsplash.com/photo-1506365069540-904bcc762636?q=80&w=1170&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (9, 'Onion', 2, 4, 3, 4, 7, 9, FALSE, FALSE, TRUE, FALSE, 'Bulb vegetable for many dishes', 'Plant sets or seedlings for best results','https://images.unsplash.com/photo-1587049276124-b933e057e698?q=80&w=880&auto=format&fit=crop')
ON CONFLICT (id) DO UPDATE SET cropname = EXCLUDED.cropname, sowing_start = EXCLUDED.sowing_start, sowing_end = EXCLUDED.sowing_end, planting_start = EXCLUDED.planting_start, planting_end = EXCLUDED.planting_end, harvest_start = EXCLUDED.harvest_start, harvest_end = EXCLUDED.harvest_end, in_house = EXCLUDED.in_house, in_pots = EXCLUDED.in_pots, in_garden = EXCLUDED.in_garden, in_greenhouse = EXCLUDED.in_greenhouse, crop_description = EXCLUDED.crop_description, crop_tips = EXCLUDED.crop_tips, image = EXCLUDED.image;

INSERT INTO crops (id, cropname, sowing_start, sowing_end, planting_start, planting_end, harvest_start, harvest_end, in_house, in_pots, in_garden, in_greenhouse, crop_description, crop_tips, image)
VALUES (10, 'Strawberry', 3, 4, 4, 5, 6, 8, TRUE, TRUE, TRUE, TRUE, 'Sweet summer fruit', 'Protect from birds and provide well-drained soil','https://images.unsplash.com/photo-1566804770468-867f6158bda5?q=80&w=2070&auto=format&fit=crop')
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
INSERT INTO ingredient_measurements (id, measurement_name) VALUES (6, 'kilograms') ON CONFLICT (id) DO UPDATE SET measurement_name = EXCLUDED.measurement_name;

-- Ingredients
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (1, 'Tomato', 1) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (2, 'Basil', 2) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (3, 'Carrot', 3) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (4, 'Flour', NULL) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (5, 'Lettuce', 4) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (6, 'Spinach', 5) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (7, 'Potato', 6) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (8, 'Cucumber', 7) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (9, 'Bell Pepper', 8) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (10, 'Onion', 9) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (11, 'Strawberry', 10) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (12, 'Butter', NULL) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (13, 'Milk', NULL) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (14, 'Pasta', NULL) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;

-- Recipes
INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (1, 'Tomato Basil Salad', NULL, 'Fresh salad with tomatoes and basil', '10 min', '0 min', 'https://images.unsplash.com/photo-1622637103261-ae624e188bd0?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 2, 1)
ON CONFLICT (id) DO UPDATE SET recipe_name = EXCLUDED.recipe_name, author = EXCLUDED.author, recipe_description = EXCLUDED.recipe_description, prep_time = EXCLUDED.prep_time, cook_time = EXCLUDED.cook_time, image = EXCLUDED.image, course_id = EXCLUDED.course_id, category_id = EXCLUDED.category_id;

INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (2, 'Carrot Soup', NULL, 'Warm carrot soup', '20 min', '30 min', 'https://images.unsplash.com/photo-1666083580269-6f409e1765d8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 1, 2)
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

-- Additional recipes, quantities and steps
INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (3, 'Mashed Potatoes', NULL, 'Creamy mashed potatoes', '15 min', '30 min', 'https://images.unsplash.com/photo-1633436375153-d7045cb93e38?q=80&w=765&auto=format&fit=crop', 1, 6)
ON CONFLICT (id) DO UPDATE SET recipe_name = EXCLUDED.recipe_name, author = EXCLUDED.author, recipe_description = EXCLUDED.recipe_description, prep_time = EXCLUDED.prep_time, cook_time = EXCLUDED.cook_time, image = EXCLUDED.image, course_id = EXCLUDED.course_id, category_id = EXCLUDED.category_id;

INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (5, 3, 7, 1, 500.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (6, 3, 12, 1, 50.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (7, 3, 13, 2, 100.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;

INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (5, 1, 'Peel and cut the potatoes into even chunks.', 3) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (6, 2, 'Boil potatoes until tender, about 15-20 minutes.', 3) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (7, 3, 'Drain and mash potatoes, then stir in butter and milk until creamy.', 3) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;

INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (4, 'Cucumber Lettuce Salad', NULL, 'Light salad with cucumber, lettuce and basil', '10 min', '0 min', 'https://images.unsplash.com/photo-1722032617357-7b09276b1a8d?q=80&w=1173&auto=format&fit=crop', 2, 2)
ON CONFLICT (id) DO UPDATE SET recipe_name = EXCLUDED.recipe_name, author = EXCLUDED.author, recipe_description = EXCLUDED.recipe_description, prep_time = EXCLUDED.prep_time, cook_time = EXCLUDED.cook_time, image = EXCLUDED.image, course_id = EXCLUDED.course_id, category_id = EXCLUDED.category_id;

INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (8, 4, 8, 3, 1.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (9, 4, 5, 3, 2.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (10, 4, 10, 3, 1.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (11, 4, 2, 1, 5.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;

INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (8, 1, 'Wash and slice cucumber and lettuce.', 4) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (9, 2, 'Thinly slice onion and add to the bowl.', 4) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (10, 3, 'Tear or chop basil and sprinkle over the salad.', 4) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (11, 4, 'Toss gently and serve chilled.', 4) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;

-- Pantry items
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (15, 'Salt', NULL) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (16, 'Pepper', NULL) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;
INSERT INTO ingredients (id, ingredient_name, crop_id) VALUES (17, 'Olive Oil', NULL) ON CONFLICT (id) DO UPDATE SET ingredient_name = EXCLUDED.ingredient_name, crop_id = EXCLUDED.crop_id;

-- More recipes: Pasta Pomodoro, Strawberry Smoothie, Tomato Basil Bruschetta
INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (5, 'Pasta Pomodoro', NULL, 'Simple pasta with fresh tomato, basil and olive oil', '10 min', '20 min', 'https://images.unsplash.com/photo-1626844131082-256783844137?q=80&w=735&auto=format&fit=crop', 1, 2)
ON CONFLICT (id) DO UPDATE SET recipe_name = EXCLUDED.recipe_name, author = EXCLUDED.author, recipe_description = EXCLUDED.recipe_description, prep_time = EXCLUDED.prep_time, cook_time = EXCLUDED.cook_time, image = EXCLUDED.image, course_id = EXCLUDED.course_id, category_id = EXCLUDED.category_id;

-- Pasta Pomodoro quantities
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (12, 5, 14, 1, 200.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (13, 5, 1, 3, 2.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (14, 5, 2, 1, 10.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (15, 5, 17, 2, 15.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (16, 5, 15, 5, 0.5) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (17, 5, 16, 5, 0.25) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;

INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (12, 1, 'Boil pasta in salted water until al dente.', 5) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (13, 2, 'Meanwhile, sauté chopped tomatoes in olive oil briefly.', 5) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (14, 3, 'Toss pasta with tomatoes and basil, season and serve.', 5) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;

INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (6, 'Strawberry Smoothie', NULL, 'Quick smoothie with strawberries and milk', '5 min', '0 min', 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1171&auto=format&fit=crop', 3, 1)
ON CONFLICT (id) DO UPDATE SET recipe_name = EXCLUDED.recipe_name, author = EXCLUDED.author, recipe_description = EXCLUDED.recipe_description, prep_time = EXCLUDED.prep_time, cook_time = EXCLUDED.cook_time, image = EXCLUDED.image, course_id = EXCLUDED.course_id, category_id = EXCLUDED.category_id;

-- Smoothie quantities
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (18, 6, 11, 3, 6.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (19, 6, 13, 2, 250.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;

INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (15, 1, 'Combine strawberries and milk in a blender.', 6) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (16, 2, 'Blend until smooth and adjust thickness with more milk.', 6) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (17, 3, 'Serve cold.', 6) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;

INSERT INTO recipes (id, recipe_name, author, recipe_description, prep_time, cook_time, image, course_id, category_id)
VALUES (7, 'Tomato Basil Bruschetta', NULL, 'Toasted bread topped with tomato, basil and olive oil', '10 min', '10 min', 'https://images.unsplash.com/photo-1630230596944-6373069c837d?q=80&w=1170&auto=format&fit=crop', 2, 2)
ON CONFLICT (id) DO UPDATE SET recipe_name = EXCLUDED.recipe_name, author = EXCLUDED.author, recipe_description = EXCLUDED.recipe_description, prep_time = EXCLUDED.prep_time, cook_time = EXCLUDED.cook_time, image = EXCLUDED.image, course_id = EXCLUDED.course_id, category_id = EXCLUDED.category_id;

-- Bruschetta quantities
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (20, 7, 1, 3, 2.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (21, 7, 2, 1, 5.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (22, 7, 17, 2, 10.0) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (23, 7, 15, 5, 0.25) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;
INSERT INTO recipe_quantities (id, recipe_id, ingredient_id, measurement_id, quantity) VALUES (24, 7, 16, 5, 0.1) ON CONFLICT (id) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, ingredient_id = EXCLUDED.ingredient_id, measurement_id = EXCLUDED.measurement_id, quantity = EXCLUDED.quantity;

INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (18, 1, 'Chop tomatoes and basil; mix with olive oil, salt and pepper.', 7) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (19, 2, 'Toast bread slices until golden.', 7) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;
INSERT INTO recipe_steps (id, step_number, step_description, recipe_id) VALUES (20, 3, 'Top toasted bread with tomato mixture and serve.', 7) ON CONFLICT (id) DO UPDATE SET step_number = EXCLUDED.step_number, step_description = EXCLUDED.step_description, recipe_id = EXCLUDED.recipe_id;

-- User favorite crops
-- INSERT INTO user_crops (crop_id, user_id)
-- SELECT 1,1 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=1 AND user_id=1);
-- INSERT INTO user_crops (crop_id, user_id)
-- SELECT 2,1 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=2 AND user_id=1);
-- INSERT INTO user_crops (crop_id, user_id)
-- SELECT 3,2 WHERE NOT EXISTS (SELECT 1 FROM user_crops WHERE crop_id=3 AND user_id=2);

-- User favorite recipes
-- INSERT INTO user_recipes (recipe_id, user_id)
-- SELECT 1,1 WHERE NOT EXISTS (SELECT 1 FROM user_recipes WHERE recipe_id=1 AND user_id=1);
-- INSERT INTO user_recipes (recipe_id, user_id)
-- SELECT 2,2 WHERE NOT EXISTS (SELECT 1 FROM user_recipes WHERE recipe_id=2 AND user_id=2);

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
