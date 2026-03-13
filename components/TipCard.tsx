import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Together';

interface Tip {
  id: string;
  title: string;
  content: string;
  category?: string;
  source_url?: string;
}

interface TipCardProps {
  tip: Tip;
  themeColor?: string;
}

export function TipCard({ tip, themeColor = COLORS.primary }: TipCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {tip.category ? (
          <View style={[styles.catBadge, { backgroundColor: themeColor + '22' }]}>
            <Text style={[styles.catText, { color: themeColor }]}>{tip.category}</Text>
          </View>
        ) : null}
        {tip.source_url ? (
          <Text style={styles.link}>🔗 Source</Text>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>{tip.title}</Text>
      <Text style={styles.content} numberOfLines={3}>{tip.content}</Text>
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
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
  },
  link: {
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
