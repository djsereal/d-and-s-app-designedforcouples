import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { MemoryCard } from '@/components/MemoryCard';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 52) / 2;

interface Memory {
  id: string;
  prompt: string;
  image_url?: string;
  caption?: string;
  date?: string;
}

export default function MemoriesScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMemories = useCallback(async () => {
    console.log('[Memories] Fetching memories');
    try {
      const res = await authenticatedGet<Memory[]>('/api/memories');
      setMemories(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('[Memories] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMemories(); }, [fetchMemories]);

  const onRefresh = () => {
    console.log('[Memories] Pull to refresh');
    setRefreshing(true);
    fetchMemories();
  };

  const leftCol = memories.filter((_, i) => i % 2 === 0);
  const rightCol = memories.filter((_, i) => i % 2 === 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Memories 📸</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColor} />
        </View>
      ) : memories.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>📷</Text>
          <Text style={styles.emptyTitle}>No memories yet</Text>
          <Text style={styles.emptySubtitle}>Capture your first beautiful moment together</Text>
          <AnimatedPressable
            onPress={() => {
              console.log('[Memories] Add first memory pressed');
              router.push('/add-memory');
            }}
            style={[styles.emptyBtn, { backgroundColor: themeColor }]}
          >
            <Text style={styles.emptyBtnText}>Add First Memory</Text>
          </AnimatedPressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColor} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.columns}>
            <View style={styles.column}>
              {leftCol.map((m) => (
                <MemoryCard
                  key={m.id}
                  memory={m}
                  width={CARD_WIDTH}
                  onPress={() => {
                    console.log('[Memories] Memory card pressed:', m.id);
                    router.push(`/memory-detail/${m.id}`);
                  }}
                />
              ))}
            </View>
            <View style={styles.column}>
              {rightCol.map((m) => (
                <MemoryCard
                  key={m.id}
                  memory={m}
                  width={CARD_WIDTH}
                  onPress={() => {
                    console.log('[Memories] Memory card pressed:', m.id);
                    router.push(`/memory-detail/${m.id}`);
                  }}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* FAB */}
      <AnimatedPressable
        onPress={() => {
          console.log('[Memories] FAB add memory pressed');
          router.push('/add-memory');
        }}
        style={[styles.fab, { backgroundColor: themeColor }]}
      >
        <Plus size={28} color="#FFFFFF" />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  emptyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  grid: { paddingHorizontal: 16, paddingBottom: 120 },
  columns: { flexDirection: 'row', gap: 12 },
  column: { flex: 1 },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(255,107,157,0.4)',
  } as any,
});
