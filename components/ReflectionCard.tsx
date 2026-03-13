import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, REFLECTION_TYPES } from '@/constants/Together';

interface Reflection {
  id: string;
  title: string;
  type: string;
  content: string;
  created_at?: string;
  shared?: boolean;
}

interface ReflectionCardProps {
  reflection: Reflection;
}

export function ReflectionCard({ reflection }: ReflectionCardProps) {
  const typeInfo = REFLECTION_TYPES.find((t) => t.key === reflection.type) || {
    label: reflection.type,
    color: '#90A4AE',
  };
  const dateDisplay = reflection.created_at
    ? new Date(reflection.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '22', borderColor: typeInfo.color + '44' }]}>
          <Text style={[styles.typeText, { color: typeInfo.color }]}>{typeInfo.label}</Text>
        </View>
        {reflection.shared ? (
          <View style={styles.sharedBadge}>
            <Text style={styles.sharedText}>💬 Shared</Text>
          </View>
        ) : null}
        <Text style={styles.date}>{dateDisplay}</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>{reflection.title}</Text>
      <Text style={styles.content} numberOfLines={3}>{reflection.content}</Text>
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
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sharedBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sharedText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
