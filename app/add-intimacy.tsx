import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedPost, authenticatedPut } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';

const TYPE_COLORS: Record<string, string> = {
  fantasy:      '#9C27B0',
  feedback:     '#E91E63',
  try_it:       '#FF5722',
  appreciation: '#F06292',
  desire:       '#C2185B',
};

const TYPE_LABELS: Record<string, string> = {
  fantasy:      'Fantasy 💜',
  feedback:     'Feedback 💗',
  try_it:       'Try It 🔥',
  appreciation: 'Appreciation 🌸',
  desire:       'Desire 💋',
};

function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? COLORS.primary;
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export default function AddIntimacyScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    entryId,
    promptId,
    promptText,
    promptType,
    existingContent,
  } = useLocalSearchParams<{
    entryId?: string;
    promptId?: string;
    promptText?: string;
    promptType?: string;
    existingContent?: string;
  }>();

  const [content, setContent] = useState(existingContent ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!entryId;
  const color = typeColor(promptType ?? '');
  const label = typeLabel(promptType ?? '');
  const charCount = content.length;

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write your response before saving.');
      return;
    }
    console.log('[AddIntimacy] Save pressed, editing:', isEditing, 'entryId:', entryId);
    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        await authenticatedPut(`/api/intimacy/${entryId}`, { content: content.trim() });
        console.log('[AddIntimacy] Entry updated:', entryId);
      } else {
        await authenticatedPost('/api/intimacy', {
          prompt: promptText ?? '',
          content: content.trim(),
          type: promptType ?? 'desire',
        });
        console.log('[AddIntimacy] Entry created for prompt:', promptId);
      }
      router.back();
    } catch (e: any) {
      console.error('[AddIntimacy] Save error:', e);
      setError(e?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Prompt card */}
      <View style={[styles.promptCard, { backgroundColor: color }]}>
        <View style={[styles.typeBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          <Text style={styles.typeBadgeText}>{label}</Text>
        </View>
        <Text style={styles.promptText}>{promptText ?? 'Write your response...'}</Text>
      </View>

      {/* Response area */}
      <Text style={styles.label}>Your Response</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Write your response..."
        placeholderTextColor="#C4A0B5"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={10}
        textAlignVertical="top"
      />
      <Text style={styles.charCount}>{charCount} characters</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <AnimatedPressable
        onPress={handleSave}
        style={[styles.saveBtn, { backgroundColor: color }, saving && styles.disabledBtn]}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveBtnText}>{isEditing ? 'Update Entry' : 'Save Entry'}</Text>
        )}
      </AnimatedPressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  promptCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    gap: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  } as any,
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  typeBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  promptText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', lineHeight: 26 },
  label: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  textArea: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(156,39,176,0.2)',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
  },
  errorText: { color: '#FF4444', fontSize: 13, marginBottom: 12 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabledBtn: { opacity: 0.7 },
});
