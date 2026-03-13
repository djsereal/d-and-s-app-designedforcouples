import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, GOAL_CATEGORIES } from '@/constants/Together';

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  progress: number;
  target_date?: string;
}

interface GoalCardProps {
  goal: Goal;
  themeColor?: string;
}

export function GoalCard({ goal, themeColor = COLORS.primary }: GoalCardProps) {
  const cat = GOAL_CATEGORIES.find((c) => c.key === goal.category);
  const emoji = cat?.emoji || '⭐';
  const label = cat?.label || goal.category;
  const progress = Math.min(100, Math.max(0, Number(goal.progress) || 0));
  const targetDisplay = goal.target_date
    ? new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.emojiCircle, { backgroundColor: themeColor + '22' }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>{goal.title}</Text>
          <Text style={styles.category}>{label}</Text>
        </View>
        <Text style={[styles.percent, { color: themeColor }]}>{progress}%</Text>
      </View>
      {goal.description ? (
        <Text style={styles.description} numberOfLines={2}>{goal.description}</Text>
      ) : null}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: themeColor }]} />
      </View>
      {targetDisplay ? (
        <Text style={styles.target}>🎯 Target: {targetDisplay}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 12px rgba(255,107,157,0.12)',
  } as any,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  emojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  titleArea: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  percent: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 18,
  },
  progressBg: {
    height: 8,
    backgroundColor: '#FFE4EF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  target: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
