import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedPost } from '@/utils/api';
import { COLORS, MEMORY_PROMPTS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddMemoryScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedPrompt, setSelectedPrompt] = useState(MEMORY_PROMPTS[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    console.log('[AddMemory] Save pressed, prompt:', selectedPrompt, 'imageUrl:', imageUrl);
    setSaving(true);
    setError('');
    try {
      await authenticatedPost('/api/memories', {
        prompt: selectedPrompt,
        image_url: imageUrl.trim() || undefined,
        caption: caption.trim() || undefined,
        date: date.toISOString().split('T')[0],
      });
      router.back();
    } catch (e: any) {
      console.error('[AddMemory] Save error:', e);
      setError(e?.message || 'Failed to save memory.');
    } finally {
      setSaving(false);
    }
  };

  const dateLabel = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>Choose a Prompt</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
        {MEMORY_PROMPTS.map((p) => {
          const isSelected = selectedPrompt === p;
          return (
            <Pressable
              key={p}
              onPress={() => {
                console.log('[AddMemory] Prompt selected:', p);
                setSelectedPrompt(p);
              }}
              style={[
                styles.promptChip,
                isSelected && { backgroundColor: themeColor, borderColor: themeColor },
              ]}
            >
              <Text style={[styles.promptChipText, isSelected && styles.promptChipTextActive]}>
                {p}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Image URL or link</Text>
      <TextInput
        style={styles.input}
        placeholder="https://example.com/photo.jpg"
        placeholderTextColor="#C4A0B5"
        value={imageUrl}
        onChangeText={setImageUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <Text style={styles.label}>Caption</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe this memory..."
        placeholderTextColor="#C4A0B5"
        value={caption}
        onChangeText={setCaption}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>When was this?</Text>
      <Pressable
        onPress={() => {
          console.log('[AddMemory] Date picker pressed');
          setShowDatePicker(true);
        }}
        style={styles.datePicker}
      >
        <Text style={styles.datePickerText}>📅 {dateLabel}</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (d) setDate(d);
          }}
          maximumDate={new Date()}
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <AnimatedPressable
        onPress={handleSave}
        style={[styles.saveBtn, { backgroundColor: themeColor }, saving && styles.disabledBtn]}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveBtnText}>Save Memory 💕</Text>
        )}
      </AnimatedPressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  promptScroll: { marginBottom: 20, marginHorizontal: -4 },
  promptChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,157,0.3)',
    backgroundColor: COLORS.card,
    marginHorizontal: 4,
  },
  promptChipText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  promptChipTextActive: { color: '#FFFFFF' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  datePicker: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  datePickerText: { fontSize: 16, color: COLORS.text },
  errorText: { color: '#FF4444', fontSize: 13, marginBottom: 12 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabledBtn: { opacity: 0.7 },
});
