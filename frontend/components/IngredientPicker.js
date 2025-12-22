import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Dimensions, Keyboard } from 'react-native';
import useTranslation from '../hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';

export default function IngredientPicker({
  ingredients = [],
  value = '',
  selected = null,
  onChangeText = () => {},
  onSelect = () => {},
  placeholder = 'Select ingredient',
  inputRef = null,
  onFocus = null,
  theme = {},
  forceOpenUp = false,
}) {
  const [open, setOpen] = useState(false);
  const localRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dropdownTop, setDropdownTop] = useState(null);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(null);

  useEffect(() => {
    // keep native ref in sync
    if (typeof inputRef === 'function') inputRef(localRef.current);
    else if (inputRef && typeof inputRef === 'object') inputRef.current = localRef.current;
  }, [inputRef]);

  const displayValue = selected ? selected.name : value || '';
  const { t } = useTranslation();



  function handleFocus(e) {
    if (onFocus) onFocus(e);
    // when focus and there is a selection, clear selection so user can type
    if (selected) onSelect(null);
    setOpen(true);
    // compute dropdown position after layout
    requestAnimationFrame(computeDropdownPosition);
  }

  function computeDropdownPosition() {
    try {
      const win = Dimensions.get('window');
      const maxEstimate = 200; // cap dropdown height
      const itemHeight = 42;
      const estHeight = Math.min((filtered.length || 0) * itemHeight + 8, maxEstimate);

      if (localRef.current && wrapperRef.current && typeof localRef.current.measureInWindow === 'function' && typeof wrapperRef.current.measureInWindow === 'function') {
        localRef.current.measureInWindow((ix, iy, iw, ih) => {
          wrapperRef.current.measureInWindow((px, py, pw, ph) => {
            // position relative to wrapper
            const spaceBelow = win.height - (iy + ih);
            const openUp = forceOpenUp || (spaceBelow < estHeight + 8);
            // small overlap offsets to make dropdown visually touch the input
            // increase offsets to ensure the dropdown sits flush against the input
            const downOffset = -6; // pixels to move dropdown up when opening downwards
            const upOffset = 40; // pixels to move dropdown down when opening upwards
            if (openUp) {
              // open upwards (touch input field)
              const top = iy - py - estHeight + upOffset;
              setDropdownTop(top);
              setDropdownMaxHeight(estHeight);
            } else {
              // open downwards (touch input field)
              const top = iy - py + ih + downOffset;
              setDropdownTop(top);
              setDropdownMaxHeight(estHeight);
            }
          });
        });
      }
    } catch (e) {
      // ignore measurement errors
    }
  }

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', computeDropdownPosition);
    const hideSub = Keyboard.addListener('keyboardDidHide', computeDropdownPosition);
    return () => {
      try { showSub.remove(); } catch (e) { /* ignore */ }
      try { hideSub.remove(); } catch (e) { /* ignore */ }
    };
  }, [ingredients.length, value, selected, forceOpenUp]);

  const q = (selected ? '' : (value || '')).toString().toLowerCase();
  const filtered = (ingredients || []).filter((a) => {
    if (!q) return true;
    return (a.name || '').toLowerCase().includes(q) || String(a.id).includes(q);
  }).slice(0, 8);

  return (
    <View ref={wrapperRef}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          ref={localRef}
          placeholder={placeholder}
          placeholderTextColor={theme.secondaryText}
          value={displayValue}
          onChangeText={(v) => { onChangeText(v); setOpen(true); }}
          onFocus={handleFocus}
          onBlur={() => setOpen(false)}
          style={[styles.input, { backgroundColor: theme.imagePlaceholderBg || '#fff', color: theme.text || '#000', borderColor: theme.cardBorder || '#ddd' }]}
          accessibilityRole="search"
          accessibilityLabel={t ? (t('addRecipe.ingredientPlaceholder') || placeholder) : placeholder}
          accessibilityHint={t ? t('addRecipe.selectIngredientHint') : 'Opens ingredient suggestions'}
          accessibilityState={{ expanded: open }}
        />
        {selected ? (
          <TouchableOpacity
            onPress={() => { onSelect(null); setOpen(true); }}
            style={{ marginLeft: 8, padding: 6 }}
            accessibilityRole="button"
            accessibilityLabel={t ? t('addRecipe.clearSelection') : 'Clear selection'}
            accessibilityHint={t ? t('addRecipe.clearSelectionHint') : 'Clears the selected ingredient and focuses the input'}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Ionicons name="close-circle" size={20} color={theme.secondaryText || '#999'} accessible={false} />
          </TouchableOpacity>
        ) : null}
      </View>

      {open && (
        <View
          style={[styles.dropdown, { backgroundColor: theme.cardBg || '#fff', borderColor: theme.cardBorder || '#ddd', top: dropdownTop != null ? dropdownTop : 52, maxHeight: dropdownMaxHeight != null ? dropdownMaxHeight : 200 }]}
          accessibilityRole="menu"
          accessibilityLabel={t ? t('addRecipe.ingredientSuggestionsA11yLabel') : 'Ingredient suggestions'}
        > 
          {filtered.length === 0 ? (
            <View style={styles.dropdownItem} accessibilityLabel={t ? t('noMatches') : 'No matches'}>
              <Text style={{ color: theme.secondaryText || '#888' }}>{t ? t('noMatches') : 'No matches'}</Text>
            </View>
          ) : filtered.map((a) => (
            <TouchableOpacity
              key={a.id}
              onPress={() => { onSelect(a); setOpen(false); }}
              style={styles.dropdownItem}
              accessibilityRole="menuitem"
              accessibilityLabel={a.name}
              accessibilityHint={t ? t('addRecipe.selectIngredient') : 'Select this ingredient'}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            >
              <Text style={{ color: theme.text || '#000' }}>{a.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { height: 42, borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, flex: 1 },
  dropdown: { position: 'absolute', left: 0, right: 0, borderRadius: 8, borderWidth: 1, zIndex: 50 },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 10 },
});
