import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet, authenticatedDelete } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Trash2 } from 'lucide-react-native';

interface Memory {
  id: string;
  prompt: string;
  image_url?: string;
  caption?: string;
  date?: string;
  user_id?: string;
}

function resolveImageSource(source: string | undefined): ImageSourcePropType {
  if (!source) return { uri: '' };
  return { uri: source };
}

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    console.log('[MemoryDetail] Loading memory:', id);
    authenticatedGet<Memory[]>('/api/memories')
      .then((items) => {
        const found = Array.isArray(items) ? items.find((m) => m.id === id) : null;
        setMemory(found || null);
      })
      .catch((e) => console.error('[MemoryDetail] Fetch error:', e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    console.log('[MemoryDetail] Delete memory pressed:', id);
    setDeleting(true);
    try {
      await authenticatedDelete(`/api/memories/${id}`);
      router.back();
    } catch (e) {
      console.error('[MemoryDetail] Delete error:', e);
      setDeleting(false);
    }
  };

  const dateDisplay = memory?.date
    ? new Date(memory.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={themeColor} />
      </View>
    );
  }

  if (!memory) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundEmoji}>😔</Text>
        <Text style={styles.notFoundText}>Memory not found</Text>
        <AnimatedPressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: themeColor }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Image */}
      {memory.image_url ? (
        <Image
          source={resolveImageSource(memory.image_url)}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: themeColor + '22' }]}>
          <Text style={styles.imagePlaceholderEmoji}>📸</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Prompt badge */}
        <View style={[styles.promptBadge, { backgroundColor: themeColor + '18' }]}>
          <Text style={[styles.promptText, { color: themeColor }]}>{memory.prompt}</Text>
        </View>

        {/* Caption */}
        {memory.caption ? (
          <Text style={styles.caption}>{memory.caption}</Text>
        ) : null}

        {/* Date */}
        {dateDisplay ? (
          <Text style={styles.date}>📅 {dateDisplay}</Text>
        ) : null}

        {/* Delete button */}
        <AnimatedPressable
          onPress={handleDelete}
          style={styles.deleteBtn}
          disabled={deleting}
        >
          <Trash2 size={18} color="#FF4444" />
          <Text style={styles.deleteBtnText}>{deleting ? 'Deleting...' : 'Delete Memory'}</Text>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 40 },
  notFoundEmoji: { fontSize: 56, marginBottom: 12 },
  notFoundText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 24 },
  backBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  image: { width: '100%', height: 300 },
  imagePlaceholder: {
    width: '100%',
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderEmoji: { fontSize: 64 },
  content: { padding: 24 },
  promptBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  promptText: { fontSize: 14, fontWeight: '700' },
  caption: {
    fontSize: 17,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF444418',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FF444430',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: '#FF4444' },
});
