import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MOOD_MAP } from '@/constants/Together';

interface MoodBadgeProps {
  mood: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MoodBadge({ mood, size = 'md' }: MoodBadgeProps) {
  const info = MOOD_MAP[mood] || { emoji: '😐', color: '#90A4AE', label: mood };
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 15 : 13;
  const emojiSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const px = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;
  const py = size === 'sm' ? 2 : size === 'lg' ? 6 : 4;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: info.color + '22',
          paddingHorizontal: px,
          paddingVertical: py,
          borderColor: info.color + '44',
        },
      ]}
    >
      <Text style={{ fontSize: emojiSize }}>{info.emoji}</Text>
      <Text style={[styles.label, { color: info.color, fontSize }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  label: {
    fontWeight: '600',
  },
});
