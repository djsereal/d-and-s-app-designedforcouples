import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedPost, authenticatedPut, authenticatedGet } from '@/utils/api';
import { COLORS, MOOD_MAP, MOODS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';

export default function AddVentScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      console.log('[AddVent] Loading existing vent:', id);
      authenticatedGet<any>(`/api/vents`).then((vents) => {
        const vent = Array.isArray(vents) ? vents.find((v: any) => v.id === id) : null;
        if (vent) {
          setContent(vent.content || '');
          setSelectedMood(vent.mood || 'neutral');
          setShared(vent.shared || false);
        }
      }).catch((e) => console.error('[AddVent] Load error:', e));
    }
  }, [id]);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write something first');
      return;
    }
    console.log('[AddVent] Save pressed, mood:', selectedMood, 'shared:', shared);
    setSaving(true);
    setError('');
    try {
      if (id) {
        await authenticatedPut(`/api/vents/${id}`, { content: content.trim(), mood: selectedMood, shared });
      } else {
        await authenticatedPost('/api/vents', { content: content.trim(), mood: selectedMood, shared });
      }
      router.back();
    } catch (e: any) {
      console.error('[AddVent] Save error:', e);
      setError(e?.message || 'Failed to save vent.');
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
      <Text style={styles.label}>What's on your mind?</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Let it all out... this is a safe space 💕"
        placeholderTextColor="#C4A0B5"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={8}
        autoFocus
      />

      <Text style={styles.label}>How are you feeling?</Text>
      <View style={styles.moodRow}>
        {MOODS.map((m) => {
          const info = MOOD_MAP[m];
          const isSelected = selectedMood === m;
          return (
            <Pressable
              key={m}
              onPress={() => {
                console.log('[AddVent] Mood selected:', m);
                setSelectedMood(m);
              }}
              style={[
                styles.moodBtn,
                isSelected && { backgroundColor: info.color + '22', borderColor: info.color },
              ]}
            >
              <Text style={styles.moodEmoji}>{info.emoji}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.shareRow}>
        <View style={styles.shareInfo}>
          <Text style={styles.shareLabel}>Share with partner</Text>
          <Text style={styles.shareSubtitle}>They'll be able to see this vent</Text>
        </View>
        <Switch
          value={shared}
          onValueChange={(val) => {
            console.log('[AddVent] Share toggle:', val);
            setShared(val);
          }}
          trackColor={{ false: '#E0D0D8', true: themeColor + '88' }}
          thumbColor={shared ? themeColor : '#FFFFFF'}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <AnimatedPressable
        onPress={handleSave}
        style={[styles.saveBtn, { backgroundColor: themeColor }, saving && styles.disabledBtn]}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveBtnText}>{id ? 'Update Vent' : 'Save Vent'}</Text>
        )}
      </AnimatedPressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  label: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  textArea: { minHeight: 160, textAlignVertical: 'top' },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  moodBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.card,
  },
  moodEmoji: { fontSize: 26 },
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.15)',
  },
  shareInfo: { flex: 1 },
  shareLabel: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  shareSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  errorText: { color: '#FF4444', fontSize: 13, marginBottom: 12 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabledBtn: { opacity: 0.7 },
});
