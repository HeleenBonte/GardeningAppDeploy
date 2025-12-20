import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, findNodeHandle, UIManager } from 'react-native';
import { useTheme } from '../themes/ThemeContext';
import AppHeader from '../components/AppHeader';
import { getItem } from '../auth/storage';
import { createRecipe, getMeasurements, getCourses, getCategories, getIngredients } from '../config/api';

export default function AddRecipeScreen({ navigation }) {
  const { theme } = useTheme();

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
        imageURL: imageUrl,
        courseId: courseId ? Number(courseId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        quantities: ingredients.map((i) => ({
          ingredientId: i.ingredientId ? Number(i.ingredientId) : null,
          measurementId: i.measurementId ? Number(i.measurementId) : null,
          quantity: i.quantity ? Number(i.quantity) : null,
        })),
        steps: steps.map((s, idx) => ({ stepNumber: idx + 1, description: s.description })),
      };

      // Basic validation
      if (!payload.name || !payload.description || !payload.prepTime || !payload.cookTime || !payload.imageURL) {
        Alert.alert('Missing fields', 'Please fill in the required fields (name, description, prep time, cook time, image URL).');
        return;
      }
      if (!payload.quantities || payload.quantities.length === 0) {
        Alert.alert('Missing ingredients', 'Please add at least one ingredient with ingredientId, measurementId and quantity.');
        return;
      }

      // Call API
      const res = await createRecipe(payload);
      Alert.alert('Recipe created', `Recipe created with id ${res?.id ?? ''}`);
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
        <Text style={[styles.heading, { color: theme.text }]}>Add Your Recipe</Text>
        <Text style={[styles.help, { color: theme.secondaryText }]}>Share your favorite recipes with the community</Text>

        <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
          <Text style={[styles.label, { color: theme.text }]}>Recipe Name *</Text>
          <TextInput ref={(r) => { inputRefs.current.name = r; }} onFocus={() => { setOpenIngredientFor(null); scrollToNodeKey('name'); }} style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text }]} value={name} onChangeText={setName} placeholder="e.g., Fresh Garden Salad" placeholderTextColor={theme.secondaryText} />

          <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
          <TextInput ref={(r) => { inputRefs.current.description = r; }} onFocus={() => { setOpenIngredientFor(null); scrollToNodeKey('description'); }} style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text, height: 80 }]} value={description} onChangeText={setDescription} placeholder="Describe your recipe..." placeholderTextColor={theme.secondaryText} multiline />

          <Text style={[styles.label, { color: theme.text }]}>Image URL (optional)</Text>
          <TextInput ref={(r) => { inputRefs.current.imageUrl = r; }} onFocus={() => { setOpenIngredientFor(null); scrollToNodeKey('imageUrl'); }} style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text }]} value={imageUrl} onChangeText={setImageUrl} placeholder="https://example.com/image.jpg" placeholderTextColor={theme.secondaryText} />

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
                />
                <Text style={[styles.units, { color: theme.secondaryText }]}>minutes</Text>
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
                />
                <Text style={[styles.units, { color: theme.secondaryText }]}>minutes</Text>
              </View>
            </View>
          </View>

          

                  <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.label, { color: theme.text }]}>Course</Text>
                      <TouchableOpacity ref={(r) => { inputRefs.current.coursePicker = r; }} onPress={() => { closeAllDropdowns(); setOpenCourse(!openCourse); scrollToNodeKey('coursePicker'); }} style={[styles.pickerButton, { backgroundColor: theme.imagePlaceholderBg }]}>
                        <Text style={{ color: courseId ? theme.text : theme.secondaryText }}>{courseId ? (courses.find(c => String(c.id) === String(courseId))?.name ?? `#${courseId}`) : 'Select course'}</Text>
                      </TouchableOpacity>
                      {openCourse && (
                        <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
                          {courses.map((c) => (
                              <TouchableOpacity key={c.id} onPress={() => { setCourseId(String(c.id)); setOpenCourse(false); }} style={styles.dropdownItem}>
                              <Text style={{ color: theme.text }}>{c.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: theme.text }]}>Category</Text>
                      <TouchableOpacity ref={(r) => { inputRefs.current.categoryPicker = r; }} onPress={() => { closeAllDropdowns(); setOpenCategory(!openCategory); scrollToNodeKey('categoryPicker'); }} style={[styles.pickerButton, { backgroundColor: theme.imagePlaceholderBg }]}>
                        <Text style={{ color: categoryId ? theme.text : theme.secondaryText }}>{categoryId ? (categories.find(c => String(c.id) === String(categoryId))?.name ?? `#${categoryId}`) : 'Select category'}</Text>
                      </TouchableOpacity>
                      {openCategory && (
                        <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
                          {categories.map((cat) => (
                              <TouchableOpacity key={cat.id} onPress={() => { setCategoryId(String(cat.id)); setOpenCategory(false); }} style={styles.dropdownItem}>
                              <Text style={{ color: theme.text }}>{cat.name}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

          <Text style={[styles.subheading, { color: theme.text }]}>Ingredients (use IDs)</Text>
          {ingredients.map((ing) => (
            <View key={ing.id} style={styles.itemRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput ref={(r) => { inputRefs.current[`ingredientQuery-${ing.id}`] = r; }} onFocus={() => { setOpenIngredientFor(ing.id); scrollToNodeKey(`ingredientQuery-${ing.id}`); }} placeholder="Ingredient name or ID" placeholderTextColor={theme.secondaryText} value={ing.ingredientQuery || (ing.ingredientId ? String(ing.ingredientId) : '')} onChangeText={(v) => { updateIngredient(ing.id, 'ingredientQuery', v); setOpenIngredientFor(ing.id); if (/^\d+$/.test(v)) { updateIngredient(ing.id, 'ingredientId', v); } else { updateIngredient(ing.id, 'ingredientId', ''); } }} style={[styles.input, { backgroundColor: theme.imagePlaceholderBg, color: theme.text }]} />
                {openIngredientFor === ing.id && (
                  <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
                    {allIngredients.filter(a => {
                      const q = (ing.ingredientQuery || '').toLowerCase();
                      if (!q) return false;
                      return String(a.id).includes(q) || (a.name && a.name.toLowerCase().includes(q));
                    }).slice(0, 8).map((a) => (
                      <TouchableOpacity key={a.id} onPress={() => { updateIngredient(ing.id, 'ingredientId', a.id); updateIngredient(ing.id, 'ingredientQuery', a.name); setOpenIngredientFor(null); }} style={styles.dropdownItem}>
                        <Text style={{ color: theme.text }}>{a.name} #{a.id}</Text>
                      </TouchableOpacity>
                    ))}
                    {(!allIngredients.filter(a => {
                      const q = (ing.ingredientQuery || '').toLowerCase();
                      if (!q) return false;
                      return String(a.id).includes(q) || (a.name && a.name.toLowerCase().includes(q));
                    }).length) && (
                      <View style={styles.dropdownItem}><Text style={{ color: theme.secondaryText }}>No matches</Text></View>
                    )}
                  </View>
                )}
              </View>
              <TouchableOpacity ref={(r) => { inputRefs.current[`measurementPicker-${ing.id}`] = r; }} onPress={() => { closeAllDropdowns(); setOpenMeasurementFor(openMeasurementFor === ing.id ? null : ing.id); scrollToNodeKey(`measurementPicker-${ing.id}`); }} style={[styles.pickerButton, { flex: 1, marginRight: 8, backgroundColor: theme.imagePlaceholderBg }] }>
                <Text style={{ color: ing.measurementId ? theme.text : theme.secondaryText }}>{ing.measurementId ? (measurements.find(m => String(m.id) === String(ing.measurementId))?.name ?? `#${ing.measurementId}`) : 'Select measurement'}</Text>
              </TouchableOpacity>
              <TextInput ref={(r) => { inputRefs.current[`ingredientQty-${ing.id}`] = r; }} onFocus={() => scrollToNodeKey(`ingredientQty-${ing.id}`)} placeholder="Quantity" placeholderTextColor={theme.secondaryText} value={String(ing.quantity)} onChangeText={(v) => updateIngredient(ing.id, 'quantity', v)} style={[styles.input, { flex: 1, backgroundColor: theme.imagePlaceholderBg, color: theme.text }]} keyboardType="numeric" />
              <TouchableOpacity onPress={() => removeIngredient(ing.id)} style={styles.removeBtn}><Text style={{ color: theme.primary }}>×</Text></TouchableOpacity>

              {openMeasurementFor === ing.id && (
                <View style={[styles.dropdown, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}> 
                  {measurements.map((m) => (
                    <TouchableOpacity key={m.id} onPress={() => { updateIngredient(ing.id, 'measurementId', m.id); setOpenMeasurementFor(null); }} style={styles.dropdownItem}>
                      <Text style={{ color: theme.text }}>{m.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={addIngredient} style={[styles.addBtn, { borderColor: theme.primary }]}>
            <Text style={{ color: theme.primary }}>Add Ingredient</Text>
          </TouchableOpacity>

          <Text style={[styles.subheading, { color: theme.text }]}>Instructions</Text>
          {steps.map((s, idx) => (
            <View key={s.id} style={styles.itemRow}>
              <Text style={[styles.stepNumber, { color: theme.secondaryText }]}>{idx + 1}.</Text>
              <TextInput
                ref={(r) => { stepInputRefs.current[s.id] = r; }}
                placeholder={`Step ${idx + 1} description`}
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
              <TouchableOpacity onPress={() => removeStep(s.id)} style={styles.removeBtn}><Text style={{ color: theme.primary }}>×</Text></TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={addStep} style={[styles.addBtn, { borderColor: theme.primary }]}>
            <Text style={{ color: theme.primary }}>Add Step</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: theme.primary }]}>
            <Text style={[styles.submitText]}>Submit Recipe</Text>
          </TouchableOpacity>
        </View>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  help: { marginBottom: 12 },
  card: { borderRadius: 12, padding: 12, borderWidth: 1 },
  label: { fontWeight: '600', marginTop: 8 },
  input: { height: 42, borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, marginTop: 6 },
  row: { flexDirection: 'row', gap: 8, marginTop: 6 },
  subheading: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
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
