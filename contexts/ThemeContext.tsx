import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  themeColor: string;
  themeFont: string;
  setTheme: (color: string, font: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeColor: '#FF6B9D',
  themeFont: 'System',
  setTheme: () => {},
});

const STORAGE_KEY = 'together_theme';

export function TogetherThemeProvider({ children }: { children: ReactNode }) {
  const [themeColor, setThemeColor] = useState('#FF6B9D');
  const [themeFont, setThemeFont] = useState('System');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (parsed.color) setThemeColor(parsed.color);
          if (parsed.font) setThemeFont(parsed.font);
        } catch {}
      }
    });
  }, []);

  const setTheme = (color: string, font: string) => {
    setThemeColor(color);
    setThemeFont(font);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ color, font }));
  };

  return (
    <ThemeContext.Provider value={{ themeColor, themeFont, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTogetherTheme() {
  return useContext(ThemeContext);
}
