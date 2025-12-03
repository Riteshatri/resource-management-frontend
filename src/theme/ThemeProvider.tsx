// src/theme/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type ThemeMode = 'light' | 'dark';
interface ThemeShape {
  mode?: ThemeMode;
  primaryColor?: string;
  [k: string]: any;
}

type ThemeContextValue = {
  theme: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  toggle: () => void;
  remoteConfig: ThemeShape | null;
  saveTheme: (cfg?: Partial<ThemeShape>) => Promise<void>;
  loading: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Helper to convert HEX to HSL
function hexToHSL(hex: string): string {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [remoteConfig, setRemoteConfig] = useState<ThemeShape | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // 🔴 यह बदलना है: Added to prevent mode-only saves from overwriting full theme config during initial load
  const [hasLoadedTheme, setHasLoadedTheme] = useState(false);

  const saveTheme = async (cfg?: Partial<ThemeShape>) => {
    const payload = { ...(remoteConfig || {}), ...(cfg || {}) };
    if (cfg?.mode) {
      payload.mode = cfg.mode;
    } else if (remoteConfig?.mode) {
      payload.mode = remoteConfig.mode;
    } else {
      payload.mode = theme;
    }
    try {
      await api.updateTheme(payload);
      setRemoteConfig(payload);
    } catch (err) {
      console.error('Failed to save theme:', err);
      throw err;
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!hasLoadedTheme || !user || isInitialLoad) return;
    
    const saveMode = async () => {
      console.log("💾 Saving theme mode:", theme, "for user:", user.id);
      try {
        await saveTheme({ mode: theme });
        console.log("💾 Theme saved successfully!");
      } catch (err) {
        console.error("💾 Failed to save theme:", err);
      }
    };
    saveMode();
  }, [theme, user, hasLoadedTheme, isInitialLoad]);

  useEffect(() => {
    if (remoteConfig) {
      if ((remoteConfig as any).primaryColor) {
        const primaryHSL = hexToHSL((remoteConfig as any).primaryColor);
        document.documentElement.style.setProperty('--primary', primaryHSL);
        document.documentElement.style.setProperty('--ring', primaryHSL);
      }
      if ((remoteConfig as any).accentColor) {
        const accentHSL = hexToHSL((remoteConfig as any).accentColor);
        document.documentElement.style.setProperty('--accent', accentHSL);
      }
    }
  }, [remoteConfig]);

  useEffect(() => {
    let mounted = true;
    setIsInitialLoad(true);
    
    (async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token || !user) {
          if (mounted) {
            setRemoteConfig(null);
            setTheme('light');
            document.documentElement.style.removeProperty('--primary');
            document.documentElement.style.removeProperty('--accent');
            document.documentElement.style.removeProperty('--ring');
            setHasLoadedTheme(false);
            setLoading(false);
            setIsInitialLoad(false);
          }
          return;
        }
        
        console.log("🎨 Loading theme for user:", user.id);
        const cfg = await api.getTheme();
        console.log("🎨 Fetched theme config:", cfg);
        if (!mounted) return;
        
        if (cfg && Object.keys(cfg).length > 0) {
          console.log("🎨 Setting theme from saved config:", cfg);
          setRemoteConfig(cfg);
          if ((cfg as any).mode) {
            setTheme((cfg as any).mode as ThemeMode);
          } else {
            setTheme('light');
          }
        } else {
          console.log("🎨 No saved theme, using defaults");
          setRemoteConfig(null);
          setTheme('light');
        }
        setHasLoadedTheme(true);
      } catch (err) {
        console.error('🎨 Failed to load theme:', err);
        if (mounted) {
          setRemoteConfig(null);
          setTheme('light');
          setHasLoadedTheme(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const setThemeMode = (m: ThemeMode) => setTheme(m);
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const value: ThemeContextValue = {
    theme,
    setThemeMode,
    toggle,
    remoteConfig,
    saveTheme,
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
