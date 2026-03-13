import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedPut } from '@/utils/api';
import { COLORS, THEME_COLORS, FONT_OPTIONS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Check } from 'lucide-react-native';

export default function CustomizationScreen() {
  const { themeColor, themeFont, setTheme } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedColor, setSelectedColor] = useState(themeColor);
  const [customHex, setCustomHex] = useState('');
  const [selectedFont, setSelectedFont] = useState(themeFont);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const previewColor = customHex.match(/^#[0-9A-Fa-f]{6}$/) ? customHex : selectedColor;

  const handleSave = async () => {
    console.log('[Customization] Save pressed, color:', previewColor, 'font:', selectedFont);
    setSaving(true);
    setError('');
    try {
      await authenticatedPut('/api/customization', { theme_color: previewColor, theme_font: selectedFont });
      setTheme(previewColor, selectedFont);
      router.back();
    } catch (e: any) {
      console.error('[Customization] Save error:', e);
      // Still apply locally even if API fails
      setTheme(previewColor, selectedFont);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const fontFamily = FONT_OPTIONS.find((f) => f.key === selectedFont)?.fontFamily;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
    >
      {/* Preview */}
      <View style={[styles.previewCard, { borderColor: previewColor + '44' }]}>
        <Text style={[styles.previewText, { color: previewColor, fontFamily: fontFamily || undefined }]}>
          Together 💑
        </Text>
        <Text style={styles.previewSubtext}>Your love story, beautifully tracked</Text>
        <View style={[styles.previewBtn, { backgroundColor: previewColor }]}>
          <Text style={styles.previewBtnText}>Sample Button</Text>
        </View>
      </View>

      {/* Color Section */}
      <Text style={styles.sectionTitle}>Choose Your Color</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
        {THEME_COLORS.map((color) => {
          const isSelected = selectedColor === color;
          return (
            <Pressable
              key={color}
              onPress={() => {
                console.log('[Customization] Color selected:', color);
                setSelectedColor(color);
                setCustomHex('');
              }}
              style={[
                styles.colorSwatch,
                { backgroundColor: color },
                isSelected && styles.colorSwatchSelected,
              ]}
            >
              {isSelected ? <Check size={16} color="#FFFFFF" /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Custom Hex Color</Text>
      <TextInput
        style={styles.input}
        placeholder="#FF6B9D"
        placeholderTextColor="#C4A0B5"
        value={customHex}
        onChangeText={(val) => {
          const cleaned = val.startsWith('#') ? val : '#' + val;
          setCustomHex(cleaned);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={7}
      />

      {/* Font Section */}
      <Text style={styles.sectionTitle}>Choose Your Font</Text>
      {FONT_OPTIONS.map((font) => {
        const isSelected = selectedFont === font.key;
        return (
          <Pressable
            key={font.key}
            onPress={() => {
              console.log('[Customization] Font selected:', font.key);
              setSelectedFont(font.key);
            }}
            style={[styles.fontOption, isSelected && { borderColor: previewColor, backgroundColor: previewColor + '10' }]}
          >
            <View style={styles.fontOptionLeft}>
              <Text style={[styles.fontPreview, { fontFamily: font.fontFamily || undefined, color: previewColor }]}>
                Together 💑
              </Text>
              <Text style={styles.fontName}>{font.label}</Text>
            </View>
            {isSelected ? (
              <View style={[styles.checkCircle, { backgroundColor: previewColor }]}>
                <Check size={14} color="#FFFFFF" />
              </View>
            ) : null}
          </Pressable>
        );
      })}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <AnimatedPressable
        onPress={handleSave}
        style={[styles.saveBtn, { backgroundColor: previewColor }, saving && styles.disabledBtn]}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveBtnText}>Save Customization ✨</Text>
        )}
      </AnimatedPressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  previewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 2,
    boxShadow: '0 4px 20px rgba(255,107,157,0.15)',
  } as any,
  previewText: { fontSize: 32, fontWeight: '800', marginBottom: 6 },
  previewSubtext: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16 },
  previewBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24 },
  previewBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  colorScroll: { marginBottom: 20, marginHorizontal: -4 },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    boxShadow: '0 0 0 3px rgba(255,255,255,0.8), 0 0 0 5px rgba(0,0,0,0.2)',
  } as any,
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  fontOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  fontOptionLeft: { flex: 1 },
  fontPreview: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  fontName: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: '#FF4444', fontSize: 13, marginBottom: 12 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabledBtn: { opacity: 0.7 },
});
