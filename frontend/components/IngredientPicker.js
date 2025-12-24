import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Text, StyleSheet, Dimensions, Keyboard, Platform, ScrollView } from 'react-native';
import RootSiblings from 'react-native-root-siblings';
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
}) {
  const [open, setOpen] = useState(false);
  const localRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dropdownTop, setDropdownTop] = useState(null);
  const [dropdownBottom, setDropdownBottom] = useState(null);
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState(null);
  const [dropdownWindowTop, setDropdownWindowTop] = useState(null);
  const [dropdownWindowLeft, setDropdownWindowLeft] = useState(null);
  const [dropdownWindowWidth, setDropdownWindowWidth] = useState(null);
  const [usePortal, setUsePortal] = useState(false);
  const portalRef = useRef(null);

  useEffect(() => {
    if (typeof inputRef === 'function') inputRef(localRef.current);
    else if (inputRef && typeof inputRef === 'object') inputRef.current = localRef.current;
  }, [inputRef]);

  const displayValue = selected ? selected.name : value || '';
  const { t } = useTranslation();

  const [localValue, setLocalValue] = useState(displayValue);
  useEffect(() => setLocalValue(displayValue), [displayValue]);

  const q = (selected ? '' : (value || '')).toString().toLowerCase();
  const filtered = (ingredients || [])
    .filter((a) => {
      if (!q) return true;
      return (a.name || '').toLowerCase().includes(q) || String(a.id).includes(q);
    })
    .slice(0, 8);

  function handleFocus(e) {
    if (onFocus) onFocus(e);
    if (selected) onSelect(null);
    setOpen(true);
    requestAnimationFrame(computeDropdownPosition);
  }

  function computeDropdownPosition() {
    try {
      const win = Dimensions.get('window');
      const maxEstimate = 200;
      const itemHeight = 42;
      const estHeight = Math.min((filtered.length || 0) * itemHeight + 8, maxEstimate);

      if (
        localRef.current &&
        wrapperRef.current &&
        typeof localRef.current.measureInWindow === 'function' &&
        typeof wrapperRef.current.measureInWindow === 'function'
      ) {
        localRef.current.measureInWindow((ix, iy, iw, ih) => {
          wrapperRef.current.measureInWindow((px, py, pw, ph) => {
            const spaceBelow = win.height - (iy + ih);
            const shouldOpenUp = spaceBelow < estHeight + 8;
            const downOffset = 0;
            if (shouldOpenUp) {
              const availableAboveWindow = iy - 8;
              const maxH = Math.min(estHeight, availableAboveWindow > 0 ? availableAboveWindow : estHeight);
              if (Platform.OS === 'android') {
                setDropdownWindowTop(iy - maxH);
                setDropdownWindowLeft(ix);
                setDropdownWindowWidth(iw);
                setDropdownMaxHeight(maxH);
                setDropdownTop(null);
                setDropdownBottom(null);
                setUsePortal(true);
              } else {
                const bottom = py + ph - iy;
                setDropdownBottom(bottom < 0 ? 0 : bottom);
                setDropdownTop(null);
                setDropdownMaxHeight(maxH);
                setUsePortal(false);
              }
            } else {
              const top = iy - py + ih + downOffset;
              const maxTop = win.height - ph - 8;
              setDropdownTop(top > maxTop ? maxTop : top);
              setDropdownBottom(null);
              setDropdownMaxHeight(estHeight);
            }
          });
        });
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', computeDropdownPosition);
    const hideSub = Keyboard.addListener('keyboardDidHide', computeDropdownPosition);
    return () => {
      try { showSub.remove(); } catch (e) {}
      try { hideSub.remove(); } catch (e) {}
    };
  }, [ingredients.length, value, selected]);

  useEffect(() => {
    if (open) requestAnimationFrame(computeDropdownPosition);
  }, [open, filtered.length, value]);

  useEffect(() => {
    if (Platform.OS === 'android' && open && usePortal) {
      const id = setTimeout(() => {
        try { if (localRef.current && typeof localRef.current.focus === 'function') localRef.current.focus(); } catch (e) {}
      }, 80);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open, usePortal]);

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    if (open && usePortal) {
      const renderContent = () => (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2147483647, elevation: 2147483647 }} pointerEvents="box-none">
          <TouchableWithoutFeedback onPress={() => setOpen(false)}>
            <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          </TouchableWithoutFeedback>
          <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <View
              style={[
                styles.dropdown,
                {
                  position: 'absolute',
                  left: dropdownWindowLeft != null ? dropdownWindowLeft : 0,
                  top: dropdownWindowTop != null ? dropdownWindowTop : 0,
                  width: dropdownWindowWidth != null ? dropdownWindowWidth : undefined,
                  backgroundColor: theme.cardBg || '#fff',
                  borderColor: theme.cardBorder || '#ddd',
                  maxHeight: dropdownMaxHeight != null ? dropdownMaxHeight : 200,
                  zIndex: 2147483647,
                  elevation: 2147483647,
                },
              ]}
              accessibilityRole="menu"
              accessibilityLabel={t ? t('addRecipe.ingredientSuggestionsA11yLabel') : 'Ingredient suggestions'}
            >
              {filtered.length === 0 ? (
                <View style={styles.dropdownItem} accessibilityLabel={t ? t('noMatches') : 'No matches'}>
                  <Text style={{ color: theme.secondaryText || '#888' }}>{t ? t('noMatches') : 'No matches'}</Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: dropdownMaxHeight != null ? dropdownMaxHeight : 200 }} nestedScrollEnabled>
                  {filtered.map((a) => (
                    <TouchableOpacity
                      key={a.id}
                      onPress={() => {
                        try { onSelect(a); } catch (e) {}
                        try { setLocalValue(a.name); } catch (e) {}
                        try { if (typeof onChangeText === 'function') onChangeText(a.name); } catch (e) {}
                        setOpen(false);
                      }}
                      style={styles.dropdownItem}
                      accessibilityRole="menuitem"
                      accessibilityLabel={a.name}
                      accessibilityHint={t ? t('addRecipe.selectIngredient') : 'Select this ingredient'}
                      hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                    >
                      <Text style={{ color: theme.text || '#000' }}>{a.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      );

      if (portalRef.current) {
        try { portalRef.current.update(renderContent()); } catch (e) {}
      } else {
        try { portalRef.current = new RootSiblings(renderContent()); } catch (e) {}
      }
    } else {
      if (portalRef.current) {
        try { portalRef.current.destroy(); portalRef.current = null; } catch (e) {}
      }
    }
    return () => {
      if (portalRef.current) {
        try { portalRef.current.destroy(); portalRef.current = null; } catch (e) {}
      }
    };
  }, [open, usePortal, dropdownWindowLeft, dropdownWindowTop, dropdownWindowWidth, dropdownMaxHeight, filtered.length, theme, t]);

  return (
    <View ref={wrapperRef}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          ref={localRef}
          placeholder={placeholder}
          placeholderTextColor={theme.secondaryText}
          value={localValue}
          onChangeText={(v) => { setLocalValue(v); try { if (typeof onChangeText === 'function') onChangeText(v); } catch (e) {} setOpen(true); }}
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
            onPress={() => { try { onSelect(null); } catch (e) {} try { setLocalValue(''); } catch (e) {} try { if (typeof onChangeText === 'function') onChangeText(''); } catch (e) {} setOpen(true); }}
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

      {open && !usePortal && (
        <View
          style={[styles.dropdown, { backgroundColor: theme.cardBg || '#fff', borderColor: theme.cardBorder || '#ddd', top: dropdownTop != null ? dropdownTop : undefined, bottom: dropdownBottom != null ? dropdownBottom : undefined, maxHeight: dropdownMaxHeight != null ? dropdownMaxHeight : 200 }]}
          accessibilityRole="menu"
          accessibilityLabel={t ? t('addRecipe.ingredientSuggestionsA11yLabel') : 'Ingredient suggestions'}
        >
          {filtered.length === 0 ? (
            <View style={styles.dropdownItem} accessibilityLabel={t ? t('noMatches') : 'No matches'}>
              <Text style={{ color: theme.secondaryText || '#888' }}>{t ? t('noMatches') : 'No matches'}</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: dropdownMaxHeight != null ? dropdownMaxHeight : 200 }} nestedScrollEnabled>
              {filtered.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => { try { onSelect(a); } catch (e) {} try { setLocalValue(a.name); } catch (e) {} try { if (typeof onChangeText === 'function') onChangeText(a.name); } catch (e) {} setOpen(false); }}
                  style={styles.dropdownItem}
                  accessibilityRole="menuitem"
                  accessibilityLabel={a.name}
                  accessibilityHint={t ? t('addRecipe.selectIngredient') : 'Select this ingredient'}
                  hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                >
                  <Text style={{ color: theme.text || '#000' }}>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { height: 42, borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, flex: 1 },
  dropdown: { position: 'absolute', left: 0, right: 0, borderRadius: 8, borderWidth: 1, zIndex: 99999, elevation: 99999, overflow: 'visible' },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 10 },
});
