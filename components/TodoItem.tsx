import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '@/constants/Together';

interface Todo {
  id: string;
  title: string;
  category: string;
  assigned_to?: string;
  due_date?: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  themeColor?: string;
  currentUserId?: string;
}

export function TodoItem({ todo, onToggle, themeColor = COLORS.primary, currentUserId }: TodoItemProps) {
  const dueDisplay = todo.due_date
    ? new Date(todo.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const isAssignedToMe = todo.assigned_to === currentUserId || todo.assigned_to === 'me';
  const assigneeLabel = isAssignedToMe ? 'Me' : 'Partner';
  const assigneeInitial = isAssignedToMe ? 'M' : 'P';

  return (
    <View style={[styles.row, todo.completed && styles.completedRow]}>
      <Pressable
        onPress={() => {
          console.log('[TodoItem] Toggle todo:', todo.id, 'completed:', !todo.completed);
          onToggle(todo.id);
        }}
        style={[styles.checkbox, todo.completed && { backgroundColor: themeColor, borderColor: themeColor }]}
      >
        {todo.completed ? <Text style={styles.checkmark}>✓</Text> : null}
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.title, todo.completed && styles.completedText]} numberOfLines={1}>
          {todo.title}
        </Text>
        <View style={styles.meta}>
          {dueDisplay ? <Text style={styles.due}>📅 {dueDisplay}</Text> : null}
        </View>
      </View>
      <View style={[styles.assigneeBadge, { backgroundColor: themeColor + '22' }]}>
        <Text style={[styles.assigneeText, { color: themeColor }]}>{assigneeInitial}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    boxShadow: '0 1px 6px rgba(255,107,157,0.08)',
  } as any,
  completedRow: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  due: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  assigneeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
