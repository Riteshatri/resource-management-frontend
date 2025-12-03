import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/theme/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Palette } from 'lucide-react';
import Layout from '@/components/Layout';

interface ColorScheme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  bgGradient: string;
}

const colorSchemes: ColorScheme[] = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calm and professional blue tones',
    primaryColor: '#0ea5e9',
    accentColor: '#0284c7',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    description: 'Fresh and vibrant green shades',
    primaryColor: '#10b981',
    accentColor: '#059669',
    bgGradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm and energetic orange hues',
    primaryColor: '#f59e0b',
    accentColor: '#d97706',
    bgGradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Elegant and sophisticated purple',
    primaryColor: '#a855f7',
    accentColor: '#9333ea',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'crimson-red',
    name: 'Crimson Red',
    description: 'Bold and powerful red accents',
    primaryColor: '#ef4444',
    accentColor: '#dc2626',
    bgGradient: 'linear-gradient(135deg, #f85032 0%, #e73827 100%)',
  },
];

export default function ThemeSettings() {
  const navigate = useNavigate();
  const { theme, setThemeMode, remoteConfig, saveTheme } = useTheme();
  const { toast } = useToast();
  const [selectedScheme, setSelectedScheme] = useState<string>('ocean-blue');
  const [applying, setApplying] = useState(false);

  // Load saved theme scheme on component mount
  useEffect(() => {
    if (remoteConfig?.schemeId) {
      setSelectedScheme(remoteConfig.schemeId as string);
    } else if (remoteConfig?.primaryColor) {
      // Find matching scheme by color
      const matchingScheme = colorSchemes.find(
        scheme => scheme.primaryColor.toLowerCase() === (remoteConfig.primaryColor as string).toLowerCase()
      );
      if (matchingScheme) {
        setSelectedScheme(matchingScheme.id);
      }
    }
  }, [remoteConfig]);

  // Helper function to convert HEX to HSL format for Shadcn
  const hexToHSL = (hex: string): string => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
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
    
    // Return HSL in Shadcn format (no hsl() wrapper, just values)
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applyTheme = async (scheme: ColorScheme) => {
    setApplying(true);
    try {
      // Convert HEX to HSL for Shadcn UI
      const primaryHSL = hexToHSL(scheme.primaryColor);
      const accentHSL = hexToHSL(scheme.accentColor);
      
      // Update Shadcn CSS variables (HSL format)
      document.documentElement.style.setProperty('--primary', primaryHSL);
      document.documentElement.style.setProperty('--accent', accentHSL);
      document.documentElement.style.setProperty('--ring', primaryHSL);
      
      // Save to backend
      await saveTheme({
        primaryColor: scheme.primaryColor,
        accentColor: scheme.accentColor,
        schemeId: scheme.id,
      });

      setSelectedScheme(scheme.id);
      
      toast({
        title: 'Theme Applied!',
        description: `${scheme.name} theme has been applied successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply theme',
        variant: 'destructive',
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Palette className="h-8 w-8" />
              Theme Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Customize your dashboard appearance
            </p>
          </div>
        </div>

        {/* Dark/Light Mode Toggle */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Display Mode</CardTitle>
            <CardDescription>Switch between light and dark mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setThemeMode('light')}
              >
                Light Mode
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setThemeMode('dark')}
              >
                Dark Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Schemes */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Color Schemes</h2>
          <p className="text-muted-foreground mb-6">
            Choose a color scheme to personalize your dashboard
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {colorSchemes.map((scheme) => (
              <Card
                key={scheme.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedScheme === scheme.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedScheme(scheme.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scheme.name}</CardTitle>
                    {selectedScheme === scheme.id && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <CardDescription>{scheme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Color Preview */}
                  <div
                    className="h-24 rounded-lg mb-4"
                    style={{ background: scheme.bgGradient }}
                  />
                  
                  <div className="flex gap-2 mb-4">
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-200"
                      style={{ backgroundColor: scheme.primaryColor }}
                      title="Primary Color"
                    />
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-200"
                      style={{ backgroundColor: scheme.accentColor }}
                      title="Accent Color"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTheme(scheme);
                    }}
                    disabled={applying}
                    variant={selectedScheme === scheme.id ? 'default' : 'outline'}
                  >
                    {applying && selectedScheme === scheme.id
                      ? 'Applying...'
                      : selectedScheme === scheme.id
                      ? 'Applied'
                      : 'Apply Theme'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
