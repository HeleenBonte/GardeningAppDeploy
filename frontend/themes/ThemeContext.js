import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTheme, setTheme as persistTheme } from '../settings/storage';

const ThemeContext = createContext();

const seasonalColors = {
  Fall: {
    primary: '#FF6B35',
    headerBg: '#FFE5D9',
    seasonCardBg: '#FFE5D9',
    activeTabBg: '#FFF5F0',
  },
  Winter: {
    primary: '#4A90E2',
    headerBg: '#E3F2FD',
    seasonCardBg: '#E3F2FD',
    activeTabBg: '#F0F7FF',
  },
  Spring: {
    primary: '#E91E63',
    headerBg: '#FCE4EC',
    seasonCardBg: '#FCE4EC',
    activeTabBg: '#FFF0F5',
  },
  Summer: {
    primary: '#FFC107',
    headerBg: '#FFF9E6',
    seasonCardBg: '#FFF9E6',
    activeTabBg: '#FFFDF0',
  },
};

const createLightTheme = (season) => ({
  background: '#FFF',
  text: '#333',
  secondaryText: '#666',
  headerBg: seasonalColors[season].headerBg,
  cardBg: blendHex('#FFFFFF', seasonalColors[season].primary, 0.035),
  cardBorder: seasonalColors[season].secondary,
  seasonCardBg: seasonalColors[season].seasonCardBg,
  tabBorder: '#E0E0E0',
  activeTabBg: seasonalColors[season].activeTabBg,
  primary: seasonalColors[season].primary,
  imagePlaceholderBg: '#F5F5F5',
  iconColor: '#999',
});

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const h = n.toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const blendHex = (baseHex, overlayHex, alpha) => {
  const base = hexToRgb(baseHex);
  const over = hexToRgb(overlayHex);
  const r = Math.round((1 - alpha) * base.r + alpha * over.r);
  const g = Math.round((1 - alpha) * base.g + alpha * over.g);
  const b = Math.round((1 - alpha) * base.b + alpha * over.b);
  return rgbToHex(r, g, b);
};

Object.keys(seasonalColors).forEach((s) => {
  const primary = seasonalColors[s].primary;
  seasonalColors[s].secondary = blendHex(primary, '#FFFFFF', 0.62);
});

const createDarkTheme = (season) => {
  const primary = seasonalColors[season].primary;
  const cardBg = blendHex('#252525', primary, 0.06);
  const seasonCardBg = blendHex('#2D2D2D', primary, 0.08);
  const imagePlaceholderBg = blendHex('#2D2D2D', primary, 0.04);
  const activeTabBg = blendHex('#3A3A3A', primary, 0.06);
  const cardBorder = blendHex('#3A3A3A', primary, 0.12);

  return {
    background: '#1A1A1A',
    text: '#E0E0E0',
    secondaryText: '#A0A0A0',
    headerBg: '#2D2D2D',
    cardBg,
    cardBorder,
    seasonCardBg,
    tabBorder: '#3A3A3A',
    activeTabBg,
    primary,
    imagePlaceholderBg,
    iconColor: '#666',
  };
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Dev Override
  const [seasonOverride, setSeasonOverride] = useState(null);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      // persist preference (light/dark)
      try {
        persistTheme(next ? 'dark' : 'light');
      } catch (e) {
        // ignore persistence errors
      }
      return next;
    });
  };


  const getCurrentSeason = (date = new Date()) => {
    const month = date.getMonth(); // 0 = Jan
    const day = date.getDate();

    const isOnOrAfter = (m, d) => (month > m) || (month === m && day >= d);


    // Winter: Dec 21 - Mar 19
    if ( (month === 11 && day >= 21) || month === 0 || month === 1 || (month === 2 && day < 20) ) {
      return 'Winter';
    }

    // Spring: Mar 20 - Jun 20
    if ( (month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21) ) {
      return 'Spring';
    }

    // Summer: Jun 21 - Sep 22
    if ( (month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23) ) {
      return 'Summer';
    }

    // Fall: Sep 23 - Dec 20
    return 'Fall';
  };

  const currentSeason = seasonOverride || getCurrentSeason();
  const theme = isDarkMode ? createDarkTheme(currentSeason) : createLightTheme(currentSeason);

  // Load persisted theme preference on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await getTheme();
        if (!mounted || typeof saved === 'undefined' || saved === null) return;
        if (saved === 'dark') setIsDarkMode(true);
        else if (saved === 'light') setIsDarkMode(false);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, currentSeason, seasonOverride, setSeasonOverride }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
