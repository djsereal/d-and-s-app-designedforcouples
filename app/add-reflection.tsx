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
import { COLORS, REFLECTION_TYPES } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';

export default function AddReflectionScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('general');
  const [content, setContent] = useState('');
  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      console.log('[AddReflection] Loading existing reflection:', id);
      authenticatedGet<any[]>('/api/reflections').then((items) => {
        const item = Array.isArray(items) ? items.find((r: any) => r.id === id) : null;
        if (item) {
          setTitle(item.title || '');
          setType(item.type || 'general');
          setContent(item.content || '');
          setShared(item.shared || false);
        }
      }).catch((e) => console.error('[AddReflection] Load error:', e));
    }
  }, [id]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in title and content');
      return;
    }
    console.log('[AddReflection] Save pressed, type:', type, 'shared:', shared);
    setSaving(true);
    setError('');
    try {
      if (id) {
        await authenticatedPut(`/api/reflections/${id}`, { title: title.trim(), type, content: content.trim(), shared });
      } else {
        await authenticatedPost('/api/reflections', { title: title.trim(), type, content: content.trim(), shared });
      }
      router.back();
    } catch (e: any) {
      console.error('[AddReflection] Save error:', e);
      setError(e?.message || 'Failed to save reflection.');
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
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Give this reflection a title..."
        placeholderTextColor="#C4A0B5"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        {REFLECTION_TYPES.map((t) => {
          const isSelected = type === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                console.log('[AddReflection] Type selected:', t.key);
                setType(t.key);
              }}
              style={[
                styles.typeChip,
                isSelected && { backgroundColor: t.color, borderColor: t.color },
              ]}
            >
              <Text style={[styles.typeChipText, isSelected && styles.typeChipTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Your thoughts</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Write freely about this moment in your relationship..."
        placeholderTextColor="#C4A0B5"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={8}
      />

      <View style={styles.shareRow}>
        <View style={styles.shareInfo}>
          <Text style={styles.shareLabel}>Share with partner</Text>
          <Text style={styles.shareSubtitle}>They'll be able to read this reflection</Text>
        </View>
        <Switch
          value={shared}
          onValueChange={(val) => {
            console.log('[AddReflection] Share toggle:', val);
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
          <Text style={styles.saveBtnText}>{id ? 'Update Reflection' : 'Save Reflection'}</Text>
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
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,157,0.3)',
    backgroundColor: COLORS.card,
  },
  typeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  typeChipTextActive: { color: '#FFFFFF' },
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
