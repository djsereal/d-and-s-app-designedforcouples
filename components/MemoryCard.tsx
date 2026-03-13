import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/Together';

interface Memory {
  id: string;
  prompt: string;
  image_url?: string;
  caption?: string;
  date?: string;
}

interface MemoryCardProps {
  memory: Memory;
  onPress: () => void;
  width?: number;
}

function resolveImageSource(source: string | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  return { uri: source };
}

export function MemoryCard({ memory, onPress, width = 160 }: MemoryCardProps) {
  const dateDisplay = memory.date ? new Date(memory.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <Pressable onPress={onPress} style={[styles.card, { width }]}>
      <View style={styles.imageContainer}>
        {memory.image_url ? (
          <Image
            source={resolveImageSource(memory.image_url)}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>📸</Text>
          </View>
        )}
        <View style={styles.promptBadge}>
          <Text style={styles.promptText} numberOfLines={1}>{memory.prompt}</Text>
        </View>
      </View>
      {memory.caption ? (
        <Text style={styles.caption} numberOfLines={2}>{memory.caption}</Text>
      ) : null}
      {dateDisplay ? (
        <Text style={styles.date}>{dateDisplay}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    boxShadow: '0 2px 12px rgba(255,107,157,0.12)',
  } as any,
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFE4EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  promptBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(45,27,51,0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  promptText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    color: COLORS.text,
    paddingHorizontal: 10,
    paddingTop: 8,
    lineHeight: 18,
  },
  date: {
    fontSize: 11,
    color: COLORS.textSecondary,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 4,
  },
});
