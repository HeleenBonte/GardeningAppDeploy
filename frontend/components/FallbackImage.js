import React, { useMemo } from 'react';
import { Image } from 'react-native';

const FALLBACKS = {
  crop: [
    'https://images.unsplash.com/photo-1566804770468-867f6158bda5?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1661604661117-790b6cb80108?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486328228599-85db4443971f?q=80&w=1170&auto=format&fit=crop'
  ],
  recipe: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1170&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=687&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=764&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=1170&auto=format&fit=crop'
  ]
};

function pick(list, seed) {
  if (!Array.isArray(list) || list.length === 0) return null;
  if (seed == null) return list[Math.floor(Math.random() * list.length)];
  let h = 0; const s = String(seed);
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i);
  const idx = Math.abs(h) % list.length;
  return list[idx];
}

export default function FallbackImage({ sourceUrl, type = 'recipe', id = null, style, ...rest }) {
  const uri = useMemo(() => {
    if (sourceUrl) return sourceUrl;
    const list = FALLBACKS[type] || FALLBACKS.recipe;
    return pick(list, id);
  }, [sourceUrl, type, id]);

  if (!uri) return null;
  const finalProps = { ...rest };
  if (!finalProps.accessibilityRole) finalProps.accessibilityRole = 'image';
  if (!finalProps.accessibilityLabel) finalProps.accessibilityLabel = type === 'crop' ? 'Crop image' : 'Recipe image';
  return <Image source={{ uri }} style={style} {...finalProps} />;
}
