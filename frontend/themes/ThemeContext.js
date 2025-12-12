import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

// Seasonal color schemes
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
  // blend a very subtle seasonal tint into card backgrounds for light mode
  cardBg: blendHex('#FFFFFF', seasonalColors[season].primary, 0.035),
  // use the season primary as the card border color for a seasonal accent
  cardBorder: seasonalColors[season].secondary,
  seasonCardBg: seasonalColors[season].seasonCardBg,
  tabBorder: '#E0E0E0',
  activeTabBg: seasonalColors[season].activeTabBg,
  primary: seasonalColors[season].primary,
  imagePlaceholderBg: '#F5F5F5',
  iconColor: '#999',
});

// Utility: blend two hex colors with given alpha for overlay color
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

// Compute a slightly darker 'secondary' variant for each season's primary color
// secondary = primary blended with black to make it less bright (subtle)
Object.keys(seasonalColors).forEach((s) => {
  const primary = seasonalColors[s].primary;
  // 18% white overlay to reduce brightness without changing hue dramatically
  seasonalColors[s].secondary = blendHex(primary, '#FFFFFF', 0.62);
});

const createDarkTheme = (season) => {
  const primary = seasonalColors[season].primary;
  // subtle tints to give cards a seasonal hue in dark mode
  const cardBg = blendHex('#252525', primary, 0.06); // 6% tint
  const seasonCardBg = blendHex('#2D2D2D', primary, 0.08); // 8% tint
  const imagePlaceholderBg = blendHex('#2D2D2D', primary, 0.04);
  const activeTabBg = blendHex('#3A3A3A', primary, 0.06);
  // tint the dark card border slightly with the season color for a subtle accent
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
  // Optional override for development/testing: when non-null, this season will be used instead of auto-detected
  const [seasonOverride, setSeasonOverride] = useState(null);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Compute current season using month and day for more accurate boundaries
  // Uses approximate astronomical season start dates (northern hemisphere):
  // Spring: Mar 20, Summer: Jun 21, Fall: Sep 23, Winter: Dec 21
  const getCurrentSeason = (date = new Date()) => {
    const month = date.getMonth(); // 0 = Jan
    const day = date.getDate();

    // Helper to compare month/day
    const isOnOrAfter = (m, d) => (month > m) || (month === m && day >= d);

    if (isOnOrAfter(11, 21) || isOnOrAfter(0, 1) && !isOnOrAfter(2, 19)) {
      // Dec 21 - Mar 19 => Winter
      // The logic below will correctly capture Dec 21 -> end of year and Jan/Feb
    }

    // Determine season
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
