import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, findNodeHandle, UIManager } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';
import { getItem } from '../auth/storage';
import { createRecipe, getMeasurements, getCourses, getCategories, getIngredients } from '../config/api';
import unitConverter from '../lib/unitConverter';
import useUnitPreference from '../hooks/useUnitPreference';
import useTranslation from '../hooks/useTranslation';
import IngredientPicker from '../components/IngredientPicker';
import commonStyles from '../themes/styles';

export default function AddRecipeScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [courseId, setCourseId] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const [ingredients, setIngredients] = useState([{ id: Date.now(), ingredientId: '', ingredientQuery: '', measurementId: '', quantity: '' }]);
  const [steps, setSteps] = useState([{ id: Date.now() + 1, description: '' }]);
  const [measurements, setMeasurements] = useState([]);
  const [openMeasurementFor, setOpenMeasurementFor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [openCourse, setOpenCourse] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [allIngredients, setAllIngredients] = useState([]);
  const [openIngredientFor, setOpenIngredientFor] = useState(null);

  function addIngredient() {
    setIngredients(prev => [...prev, { id: Date.now(), ingredientId: '', measurementId: '', quantity: '' }]);
  }
  function removeIngredient(id) {
    setIngredients(prev => prev.filter(i => i.id !== id));
  }
  function updateIngredient(id, field, value) {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMeasurements();
        if (mounted && Array.isArray(res)) setMeasurements(res);
      } catch (err) {
        console.warn('Failed to load measurements', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const { unitSystem } = useUnitPreference();

  function displayMeasurementLabel(name) {
    if (!name) return '';
    const nm = String(name).toLowerCase();
    // keep tsp/tbsp and pieces as-is
    if (/\btsp\b/.test(nm)) return 'tsp';
    if (/\btbsp\b/.test(nm)) return 'tbsp';
    if (/\b(piece|pieces|pcs|pc|count|stück|st)\b/.test(nm)) return name;
    // kilograms -> show lb for imperial
    if (nm.includes('kg') || nm.includes('kilogram')) return unitSystem === 'imperial' ? 'lbs' : name;
    // grams -> show oz for imperial (we display ounces for smaller weights)
    if (nm.includes('g') || nm.includes('gram')) return unitSystem === 'imperial' ? 'oz' : name;
    // milliliters -> show fl oz for imperial
    if (nm.includes('ml') || nm.includes('milliliter') || nm.includes('l') || nm.includes('liter')) return unitSystem === 'imperial' ? 'fl oz' : name;
    return name;
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getIngredients();
        if (mounted && Array.isArray(res)) setAllIngredients(res);
      } catch (err) {
        console.warn('Failed to load ingredients', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCourses();
        if (mounted && Array.isArray(res)) setCourses(res);
      } catch (err) {
        console.warn('Failed to load courses', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getCategories();
        if (mounted && Array.isArray(res)) setCategories(res);
      } catch (err) {
        console.warn('Failed to load categories', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function addStep() {
    setSteps(prev => [...prev, { id: Date.now(), description: '' }]);
  }
  function removeStep(id) {
    setSteps(prev => prev.filter(s => s.id !== id));
  }
  function updateStep(id, value) {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, description: value } : s));
  }

  async function handleSubmit() {
    try {
      const userId = await getItem('user_id');
        const payload = {
        name,
        authorId: userId ? Number(userId) : null,
        description,
        prepTime: prepTime ? `${prepTime} minutes` : null,
        cookTime: cookTime ? `${cookTime} minutes` : null,
        imageURL: imageUrl ? imageUrl : null,
        courseId: courseId ? Number(courseId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        quantities: ingredients.map((i) => {
          const ingredientId = i.ingredientId ? Number(i.ingredientId) : null;
          const measurementId = i.measurementId ? Number(i.measurementId) : null;
          const rawQty = i.quantity === '' || i.quantity == null ? null : Number(i.quantity);
          let metricQty = rawQty;
          try {
            const mObj = measurements.find(m => String(m.id) === String(measurementId));
            const mName = (mObj?.name || '').toString().toLowerCase();
            if (rawQty != null && !Number.isNaN(rawQty)) {
              // weight
              if (mName.includes('kg') || mName.includes('kilogram')) {
                // measurements in kilograms: store as kilograms in payload (DB expects kg)
                if (unitSystem === 'imperial') {
                  // user enters pounds (lb) when UI shows lb -> convert pounds to kilograms
                  metricQty = unitConverter.poundsToGrams(rawQty) / 1000; // pounds -> grams -> kg
                } else {
                  metricQty = rawQty; // already in kg
                }
              } else if (mName.includes('g') || mName.includes('gram')) {
                // measurements in grams
                if (unitSystem === 'imperial') {
                  // assume input is in ounces -> convert oz to grams
                  metricQty = unitConverter.ouncesToGrams(rawQty);
                } else {
                  metricQty = rawQty;
                }
              } else if (mName.includes('l') || mName.includes('liter')) {
                // liters -> store ml
                if (unitSystem === 'imperial') {
                  metricQty = unitConverter.flOzToMl(rawQty);
                } else {
                  metricQty = rawQty * 1000;
                }
              } else if (mName.includes('ml') || mName.includes('milliliter')) {
                if (unitSystem === 'imperial') {
                  metricQty = unitConverter.flOzToMl(rawQty);
                } else {
                  metricQty = rawQty;
                }
              } else {
                // tsp, tbsp, pieces, count etc. saved as-is
                metricQty = rawQty;
              }
            } else {
              metricQty = null;
            }
          } catch (e) {
            metricQty = rawQty;
          }

          return { ingredientId, measurementId, quantity: metricQty };
        }),
        steps: steps.map((s, idx) => ({ stepNumber: idx + 1, description: s.description })),
      };

      // Basic validation (image URL is optional)
      if (!payload.name || !payload.description || !payload.prepTime || !payload.cookTime) {
        Alert.alert('Missing fields', 'Please fill in the required fields (name, description, prep time, cook time).');
        return;
      }
      if (!payload.quantities || payload.quantities.length === 0) {
        Alert.alert('Missing ingredients', 'Please add at least one ingredient with ingredientId, measurementId and quantity.');
        return;
      }

      // Call API
      const res = await createRecipe(payload);
      const createdName = res?.name ?? name;
      Alert.alert('Recipe created', `${createdName} created`);
      navigation.goBack();
    } catch (err) {
      console.warn('Failed to create recipe', err);
      Alert.alert('Error', err?.message || String(err));
    }
  }

  const scrollRef = useRef(null);
  const stepInputRefs = useRef({});
  const [keyboardHeight, setKeyboardHeight] = useState(20);
  const inputRefs = useRef({});

  function scrollToNodeKey(keyOrNode) {
    setTimeout(() => {
      try {
        const node = typeof keyOrNode === 'string' ? (inputRefs.current[keyOrNode] || stepInputRefs.current[keyOrNode]) : keyOrNode;
        if (!node || !scrollRef.current) return;
        const inputHandle = findNodeHandle(node);
        const scrollHandle = findNodeHandle(scrollRef.current);
        const buffer = 120;
        if (inputHandle && scrollHandle && UIManager && UIManager.measureLayout) {
          UIManager.measureLayout(
            inputHandle,
            scrollHandle,
            () => {},
            (left, top) => {
              scrollRef.current.scrollTo({ y: Math.max(0, top - buffer), animated: true });
            }
          );
        } else if (node && typeof node.measure === 'function') {
          node.measure((x, y, width, height, pageX, pageY) => {
            const yPos = pageY - buffer;
            scrollRef.current.scrollTo({ y: Math.max(0, yPos), animated: true });
          });
        }
      } catch (e) {
        // ignore
      }
    }, 120);
  }

  useEffect(() => {
    const onShow = (e) => {
      const h = (e && e.endCoordinates && e.endCoordinates.height) ? e.endCoordinates.height : 200;
      setKeyboardHeight(h);
    };
    const onHide = () => setKeyboardHeight(0);
    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  function handleDismissAll() {
    Keyboard.dismiss();
    setOpenIngredientFor(null);
    setOpenCourse(false);
    setOpenCategory(false);
    setOpenMeasurementFor(null);
  }

  function closeAllDropdowns() {
    setOpenIngredientFor(null);
    setOpenCourse(false);
    setOpenCategory(false);
    setOpenMeasurementFor(null);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <TouchableWithoutFeedback onPress={handleDismissAll} accessible={false}>
        <ScrollView ref={scrollRef} style={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={{ paddingBottom: keyboardHeight + 20 }}>
          <AppHeader rightIcon="close" onRightPress={() => navigation.goBack()} />
          <View style={styles.content}>
        <Text style={[styles.heading, { color: theme.text }]}>{t ? t('addRecipe.title') : 'Add Your Recipe'}</Text>
        <Text style={[styles.help, { color: theme.secondaryText }]}>{t ? t('addRecipe.help') : 'Share your favorite recipes with the community'}</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, marginHorizontal: 0, padding: 16 }]}> 
          <Text style={[styles.label, { color: theme.text }]}>{t ? t('addRecipe.recipeNameLabel') : 'Recipe Name *'}</Text>
          <TextInput
            ref={(r) => { inputRefs.current.name = r; }}
            onFocus={() => { setOpenIngredientFor(null); scrollToNodeKey('name'); }}
            style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text }]}
            value={name}
            onChangeText={setName}
            placeholder={t ? t('addRecipe.recipeNamePlaceholder') : 'e.g., Fresh Garden Salad'}
            placeholderTextColor={theme.secondaryText}
            accessibilityLabel={t ? t('addRecipe.recipeNameLabel') : 'Recipe name'}
          />

          <Text style={[styles.label, { color: theme.text }]}>{t ? t('addRecipe.descriptionLabel') : 'Description *'}</Text>
          <TextInput
            ref={(r) => { inputRefs.current.description = r; }}
            onFocus={() => { setOpenIngredientFor(null); scrollToNodeKey('description'); }}
            style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, height: 80 }]}
            value={description}
            onChangeText={setDescription}
            placeholder={t ? t('addRecipe.descriptionPlaceholder') : 'Describe your recipe...'}
            placeholderTextColor={theme.secondaryText}
            multiline
            accessibilityLabel={t ? t('addRecipe.descriptionLabel') : 'Description'}
          />

          <Text style={[styles.label, { color: theme.text }]}>{t ? t('addRecipe.imageUrlLabel') : 'Image URL (optional)'}</Text>
          <TextInput
            ref={(r) => { inputRefs.current.imageUrl = r; }}
            onFocus={() => { setOpenIngredientFor(null); scrollToNodeKey('imageUrl'); }}
            style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text }]}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={theme.secondaryText}
            accessibilityLabel={t ? t('addRecipe.imageUrlLabel') : 'Image URL'}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.label, { color: theme.text }]}>Prep Time</Text>
              <View style={styles.inlineInputRow}>
                <TextInput
                  ref={(r) => { inputRefs.current.prepTime = r; }}
                  onFocus={() => { setOpenIngredientFor(null); scrollToNodeKey('prepTime'); }}
                  style={[styles.input, { flex: 1, backgroundColor: theme.imagePlaceholderBg, color: theme.text }]}
                  value={prepTime}
                  onChangeText={(v) => setPrepTime(v.replace(/[^0-9]/g, ''))}
                  placeholder="e.g., 15"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                  accessibilityLabel={t ? t('addRecipe.prepTimeLabel') : 'Prep time'}
                />
                <Text style={[styles.units, { color: theme.secondaryText }]}>min</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Cook Time</Text>
              <View style={styles.inlineInputRow}>
                <TextInput
                  ref={(r) => { inputRefs.current.cookTime = r; }}
                  onFocus={() => { setOpenIngredientFor(null); scrollToNodeKey('cookTime'); }}
                  style={[styles.input, { flex: 1, backgroundColor: theme.imagePlaceholderBg, color: theme.text }]}
                  value={cookTime}
                  onChangeText={(v) => setCookTime(v.replace(/[^0-9]/g, ''))}
                  placeholder="e.g., 30"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                  accessibilityLabel={t ? t('addRecipe.cookTimeLabel') : 'Cook time'}
                />
                <Text style={[styles.units, { color: theme.secondaryText }]}>min</Text>
              </View>
            </View>
          </View>

          

                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                              <Text style={[styles.label, { color: theme.text }]}>{t ? t('addRecipe.courseLabel') : 'Course'}</Text>
                      <TouchableOpacity
                        ref={(r) => { inputRefs.current.coursePicker = r; }}
                        onPress={() => { closeAllDropdowns(); setOpenCourse(!openCourse); scrollToNodeKey('coursePicker'); }}
                        style={[styles.pickerButton, { backgroundColor: theme.imagePlaceholderBg }]}
                        accessibilityRole="button"
                        accessibilityLabel={courseId ? (courses.find(c => String(c.id) === String(courseId))?.name ?? `#${courseId}`) : (t ? t('addRecipe.selectCourse') : 'Select course')}
                        accessibilityHint={t ? t('addRecipe.selectCourse') : 'Opens course picker'}
                        hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                      >
                        <Text style={{ color: courseId ? theme.text : theme.secondaryText }}>{courseId ? (courses.find(c => String(c.id) === String(courseId))?.name ?? `#${courseId}`) : (t ? t('addRecipe.selectCourse') : 'Select course')}</Text>
                      </TouchableOpacity>
                      {openCourse && (
                        <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                          {courses.map((c) => (
                              <TouchableOpacity key={c.id} onPress={() => { setCourseId(String(c.id)); setOpenCourse(false); }} style={styles.dropdownItem} accessibilityRole="button" accessibilityLabel={c.name}>
                                <Text style={{ color: theme.text }}>{c.name}</Text>
                              </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: theme.text }]}>{t ? t('addRecipe.categoryLabel') : 'Category'}</Text>
                      <TouchableOpacity
                        ref={(r) => { inputRefs.current.categoryPicker = r; }}
                        onPress={() => { closeAllDropdowns(); setOpenCategory(!openCategory); scrollToNodeKey('categoryPicker'); }}
                        style={[styles.pickerButton, { backgroundColor: theme.imagePlaceholderBg }]}
                        accessibilityRole="button"
                        accessibilityLabel={categoryId ? (categories.find(c => String(c.id) === String(categoryId))?.name ?? `#${categoryId}`) : (t ? t('addRecipe.selectCategory') : 'Select category')}
                        accessibilityHint={t ? t('addRecipe.selectCategory') : 'Opens category picker'}
                        hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                      >
                        <Text style={{ color: categoryId ? theme.text : theme.secondaryText }}>{categoryId ? (categories.find(c => String(c.id) === String(categoryId))?.name ?? `#${categoryId}`) : (t ? t('addRecipe.selectCategory') : 'Select category')}</Text>
                      </TouchableOpacity>
                      {openCategory && (
                        <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
                          {categories.map((cat) => (
                              <TouchableOpacity key={cat.id} onPress={() => { setCategoryId(String(cat.id)); setOpenCategory(false); }} style={styles.dropdownItem} accessibilityRole="button" accessibilityLabel={cat.name}>
                                <Text style={{ color: theme.text }}>{cat.name}</Text>
                              </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

          <Text style={[styles.subheading, { color: theme.text }]}>{t ? t('addRecipe.ingredientsHeading') : 'Ingredients'}</Text>
          {ingredients.map((ing) => (
            <View key={ing.id} style={styles.itemRow}>
              <View style={{ flex: 1.5, marginRight: 6 }}>
                <IngredientPicker
                  ingredients={allIngredients}
                  value={ing.ingredientQuery || (ing.ingredientId ? String(ing.ingredientId) : '')}
                  onChangeText={(v) => { updateIngredient(ing.id, 'ingredientQuery', v); setOpenIngredientFor(ing.id); if (/^\d+$/.test(v)) { updateIngredient(ing.id, 'ingredientId', v); } else { updateIngredient(ing.id, 'ingredientId', ''); } }}
                  onSelect={(a) => { if (a) { updateIngredient(ing.id, 'ingredientId', a.id); updateIngredient(ing.id, 'ingredientQuery', a.name); } else { updateIngredient(ing.id, 'ingredientId', ''); } setOpenIngredientFor(null); }}
                  inputRef={(r) => { inputRefs.current[`ingredientQuery-${ing.id}`] = r; }}
                  onFocus={() => { setOpenIngredientFor(ing.id); scrollToNodeKey(`ingredientQuery-${ing.id}`); }}
                  placeholder={t ? t('addRecipe.ingredientPlaceholder') : 'Ingredient'}
                  theme={theme}
                />
              </View>
                <TouchableOpacity
                  ref={(r) => { inputRefs.current[`measurementPicker-${ing.id}`] = r; }}
                  onPress={() => { closeAllDropdowns(); setOpenMeasurementFor(openMeasurementFor === ing.id ? null : ing.id); scrollToNodeKey(`measurementPicker-${ing.id}`); }}
                  style={[styles.pickerButton, { flex: 1.5, marginRight: 6, backgroundColor: theme.imagePlaceholderBg }] }
                  accessibilityRole="button"
                  accessibilityLabel={ing.measurementId ? (displayMeasurementLabel(measurements.find(m => String(m.id) === String(ing.measurementId))?.name ?? `#${ing.measurementId}`)) : (t ? t('addRecipe.selectMeasurement') : 'Select measurement')}
                  accessibilityHint={t ? t('addRecipe.selectMeasurement') : 'Opens measurement picker'}
                  hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                >
                  <Text style={{ color: ing.measurementId ? theme.text : theme.secondaryText }}>{ing.measurementId ? (displayMeasurementLabel(measurements.find(m => String(m.id) === String(ing.measurementId))?.name ?? `#${ing.measurementId}`)) : (t ? t('addRecipe.selectMeasurement') : 'Select measurement')}</Text>
                </TouchableOpacity>
              <TextInput
                ref={(r) => { inputRefs.current[`ingredientQty-${ing.id}`] = r; }}
                onFocus={() => scrollToNodeKey(`ingredientQty-${ing.id}`)}
                placeholder="Quantity"
                placeholderTextColor={theme.secondaryText}
                value={String(ing.quantity)}
                onChangeText={(v) => updateIngredient(ing.id, 'quantity', v)}
                style={[styles.input, { flex: 1.2, backgroundColor: theme.imagePlaceholderBg, color: theme.text }]}
                keyboardType="numeric"
                accessibilityLabel={t ? t('addRecipe.quantityLabel') : 'Quantity'}
              />
              <TouchableOpacity onPress={() => removeIngredient(ing.id)} style={styles.removeBtn} accessibilityRole="button" accessibilityLabel={t ? t('close') : 'Remove'} accessibilityHint={t ? t('addRecipe.removeIngredientA11y') : 'Removes this ingredient'} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                <Text style={{ color: theme.primary, fontSize: 20 }}>×</Text>
              </TouchableOpacity>

              {openMeasurementFor === ing.id && (
                <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
                  {measurements.map((m) => (
                    <TouchableOpacity key={m.id} onPress={() => { updateIngredient(ing.id, 'measurementId', m.id); setOpenMeasurementFor(null); }} style={styles.dropdownItem} accessibilityRole="button" accessibilityLabel={displayMeasurementLabel(m.name)}>
                      <Text style={{ color: theme.text }}>{displayMeasurementLabel(m.name)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={addIngredient} style={[styles.addBtn, { borderColor: theme.primary }]} accessibilityRole="button" accessibilityLabel={t ? t('addRecipe.addIngredient') : 'Add Ingredient'} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
            <Text style={{ color: theme.primary }}>{t ? t('addRecipe.addIngredient') : 'Add Ingredient'}</Text>
          </TouchableOpacity>

          <Text style={[styles.subheading, { color: theme.text }]}>{t ? t('addRecipe.instructions') : 'Instructions'}</Text>
          {steps.map((s, idx) => (
            <View key={s.id} style={styles.itemRow}>
              <Text style={[styles.stepNumber, { color: theme.secondaryText }]}>{idx + 1}.</Text>
              <TextInput
                ref={(r) => { stepInputRefs.current[s.id] = r; }}
                placeholder={t ? t('addRecipe.stepPlaceholder').replace('{n}', String(idx + 1)) : `Step ${idx + 1} description`}
                placeholderTextColor={theme.secondaryText}
                value={s.description}
                onChangeText={(v) => updateStep(s.id, v)}
                style={[styles.input, { flex: 1, backgroundColor: theme.imagePlaceholderBg, color: theme.text }]}
                onFocus={() => {
                  // Give keyboard a moment to open, then measure & scroll
                  setTimeout(() => {
                    try {
                      const node = stepInputRefs.current[s.id];
                      if (!node || !scrollRef.current) return;
                      const inputHandle = findNodeHandle(node);
                      const scrollHandle = findNodeHandle(scrollRef.current);
                      const buffer = 120;
                      if (inputHandle && scrollHandle && UIManager && UIManager.measureLayout) {
                        UIManager.measureLayout(
                          inputHandle,
                          scrollHandle,
                          () => {},
                          (left, top) => {
                            scrollRef.current.scrollTo({ y: Math.max(0, top - buffer), animated: true });
                          }
                        );
                      } else if (node && typeof node.measure === 'function') {
                        node.measure((x, y, width, height, pageX, pageY) => {
                          const yPos = pageY - buffer;
                          scrollRef.current.scrollTo({ y: Math.max(0, yPos), animated: true });
                        });
                      }
                    } catch (e) {
                      // ignore measurement errors
                    }
                  }, 120);
                }}
              />
              <TouchableOpacity onPress={() => removeStep(s.id)} style={styles.removeBtn} accessibilityRole="button" accessibilityLabel={t ? t('close') : 'Remove'} accessibilityHint={t ? t('addRecipe.removeStepA11y') : 'Removes this instruction step'} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                <Text style={{ color: theme.primary, fontSize: 20 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={addStep} style={[styles.addBtn, { borderColor: theme.primary }]} accessibilityRole="button" accessibilityLabel={t ? t('addRecipe.addStep') : 'Add Step'} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
            <Text style={{ color: theme.primary }}>{t ? t('addRecipe.addStep') : 'Add Step'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: theme.primary }]} accessibilityRole="button" accessibilityLabel={t ? t('addRecipe.submitRecipe') : 'Submit Recipe'} accessibilityHint={t ? t('addRecipe.submitA11yHint') : 'Submits the recipe'} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
            <Text style={[styles.submitText]}>{t ? t('addRecipe.submitRecipe') : 'Submit Recipe'}</Text>
          </TouchableOpacity>
        </View>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const localStyles = StyleSheet.create({
  content: { padding: 16 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  help: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  subheading: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  addBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, alignItems: 'center' },
  submitBtn: { marginTop: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
  pickerButton: { height: 42, borderRadius: 8, paddingHorizontal: 10, justifyContent: 'center' },
  dropdown: { position: 'absolute', top: 52, left: 0, right: 0, borderRadius: 8, borderWidth: 1, zIndex: 50 },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 10 },
  stepNumber: { width: 28, fontWeight: '700', textAlign: 'center', marginRight: 8 },
  inlineInputRow: { flexDirection: 'row', alignItems: 'center' },
  units: { marginLeft: 8 },
});
const styles = { ...commonStyles, ...localStyles };
