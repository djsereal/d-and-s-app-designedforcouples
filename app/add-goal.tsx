import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedPost, authenticatedPut, authenticatedGet } from '@/utils/api';
import { COLORS, GOAL_CATEGORIES } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';

export default function AddGoalScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('relationship');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      console.log('[AddGoal] Loading existing goal:', id);
      authenticatedGet<any[]>('/api/goals').then((items) => {
        const item = Array.isArray(items) ? items.find((g: any) => g.id === id) : null;
        if (item) {
          setTitle(item.title || '');
          setDescription(item.description || '');
          setCategory(item.category || 'relationship');
          setProgress(Number(item.progress) || 0);
          if (item.target_date) setTargetDate(new Date(item.target_date));
        }
      }).catch((e) => console.error('[AddGoal] Load error:', e));
    }
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a goal title');
      return;
    }
    console.log('[AddGoal] Save pressed, title:', title, 'category:', category, 'progress:', progress);
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        target_date: targetDate.toISOString().split('T')[0],
        progress: Math.round(progress),
      };
      if (id) {
        await authenticatedPut(`/api/goals/${id}`, payload);
      } else {
        await authenticatedPost('/api/goals', payload);
      }
      router.back();
    } catch (e: any) {
      console.error('[AddGoal] Save error:', e);
      setError(e?.message || 'Failed to save goal.');
    } finally {
      setSaving(false);
    }
  };

  const dateLabel = targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const progressRounded = Math.round(progress);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Goal Title</Text>
      <TextInput
        style={styles.input}
        placeholder="What do you want to achieve together?"
        placeholderTextColor="#C4A0B5"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe your goal in more detail..."
        placeholderTextColor="#C4A0B5"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryGrid}>
        {GOAL_CATEGORIES.map((cat) => {
          const isSelected = category === cat.key;
          return (
            <Pressable
              key={cat.key}
              onPress={() => {
                console.log('[AddGoal] Category selected:', cat.key);
                setCategory(cat.key);
              }}
              style={[
                styles.categoryChip,
                isSelected && { backgroundColor: themeColor, borderColor: themeColor },
              ]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Target Date</Text>
      <Pressable
        onPress={() => {
          console.log('[AddGoal] Date picker pressed');
          setShowDatePicker(true);
        }}
        style={styles.datePicker}
      >
        <Text style={styles.datePickerText}>🎯 {dateLabel}</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={targetDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (d) setTargetDate(d);
          }}
          minimumDate={new Date()}
        />
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.label}>Progress</Text>
          <Text style={[styles.progressValue, { color: themeColor }]}>{progressRounded}%</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={progress}
          onValueChange={(val) => setProgress(val)}
          minimumTrackTintColor={themeColor}
          maximumTrackTintColor="#FFE4EF"
          thumbTintColor={themeColor}
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
          <Text style={styles.saveBtnText}>{id ? 'Update Goal' : 'Save Goal 🎯'}</Text>
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,157,0.3)',
    backgroundColor: COLORS.card,
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  categoryLabelActive: { color: '#FFFFFF' },
  datePicker: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  datePickerText: { fontSize: 16, color: COLORS.text },
  progressSection: { marginBottom: 24 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  progressValue: { fontSize: 18, fontWeight: '700' },
  slider: { width: '100%', height: 40 },
  errorText: { color: '#FF4444', fontSize: 13, marginBottom: 12 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabledBtn: { opacity: 0.7 },
});
