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
import { COLORS, TODO_CATEGORIES } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTodoScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('chore');
  const [assignedTo, setAssignedTo] = useState<'me' | 'partner'>('me');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      console.log('[AddTodo] Loading existing todo:', id);
      authenticatedGet<any[]>('/api/todos').then((items) => {
        const item = Array.isArray(items) ? items.find((t: any) => t.id === id) : null;
        if (item) {
          setTitle(item.title || '');
          setCategory(item.category || 'chore');
          setAssignedTo(item.assigned_to === 'partner' ? 'partner' : 'me');
          if (item.due_date) setDueDate(new Date(item.due_date));
        }
      }).catch((e) => console.error('[AddTodo] Load error:', e));
    }
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    console.log('[AddTodo] Save pressed, title:', title, 'category:', category, 'assignedTo:', assignedTo);
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        category,
        assigned_to: assignedTo,
        due_date: dueDate.toISOString().split('T')[0],
      };
      if (id) {
        await authenticatedPut(`/api/todos/${id}`, payload);
      } else {
        await authenticatedPost('/api/todos', payload);
      }
      router.back();
    } catch (e: any) {
      console.error('[AddTodo] Save error:', e);
      setError(e?.message || 'Failed to save to-do.');
    } finally {
      setSaving(false);
    }
  };

  const dateLabel = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Task Title</Text>
      <TextInput
        style={styles.input}
        placeholder="What needs to be done?"
        placeholderTextColor="#C4A0B5"
        value={title}
        onChangeText={setTitle}
        autoFocus
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryRow}>
        {TODO_CATEGORIES.map((cat) => {
          const isSelected = category === cat.key;
          return (
            <Pressable
              key={cat.key}
              onPress={() => {
                console.log('[AddTodo] Category selected:', cat.key);
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

      <Text style={styles.label}>Assign To</Text>
      <View style={styles.assignRow}>
        <Pressable
          onPress={() => {
            console.log('[AddTodo] Assign to me');
            setAssignedTo('me');
          }}
          style={[
            styles.assignBtn,
            assignedTo === 'me' && { backgroundColor: themeColor, borderColor: themeColor },
          ]}
        >
          <Text style={[styles.assignBtnText, assignedTo === 'me' && styles.assignBtnTextActive]}>
            👤 Me
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            console.log('[AddTodo] Assign to partner');
            setAssignedTo('partner');
          }}
          style={[
            styles.assignBtn,
            assignedTo === 'partner' && { backgroundColor: themeColor, borderColor: themeColor },
          ]}
        >
          <Text style={[styles.assignBtnText, assignedTo === 'partner' && styles.assignBtnTextActive]}>
            💑 Partner
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Due Date</Text>
      <Pressable
        onPress={() => {
          console.log('[AddTodo] Date picker pressed');
          setShowDatePicker(true);
        }}
        style={styles.datePicker}
      >
        <Text style={styles.datePickerText}>📅 {dateLabel}</Text>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (d) setDueDate(d);
          }}
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
          <Text style={styles.saveBtnText}>{id ? 'Update To-Do' : 'Save To-Do ✅'}</Text>
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
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
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
  assignRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  assignBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,157,0.3)',
    backgroundColor: COLORS.card,
  },
  assignBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  assignBtnTextActive: { color: '#FFFFFF' },
  datePicker: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  datePickerText: { fontSize: 16, color: COLORS.text },
  errorText: { color: '#FF4444', fontSize: 13, marginBottom: 12 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabledBtn: { opacity: 0.7 },
});
