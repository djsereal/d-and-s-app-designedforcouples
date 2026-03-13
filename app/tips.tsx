import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { TipCard } from '@/components/TipCard';
import { AnimatedPressable } from '@/components/AnimatedPressable';

interface Tip {
  id: string;
  title: string;
  content: string;
  category?: string;
  source_url?: string;
}

export default function TipsScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchTips = useCallback(async () => {
    console.log('[Tips] Fetching tips');
    try {
      const res = await authenticatedGet<Tip[]>('/api/tips');
      setTips(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('[Tips] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTips(); }, [fetchTips]);

  const onRefresh = () => {
    console.log('[Tips] Pull to refresh');
    setRefreshing(true);
    fetchTips();
  };

  const categories = ['all', ...Array.from(new Set(tips.map((t) => t.category).filter(Boolean))) as string[]];
  const filtered = activeCategory === 'all' ? tips : tips.filter((t) => t.category === activeCategory);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                console.log('[Tips] Category filter pressed:', cat);
                setActiveCategory(cat);
              }}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: themeColor, borderColor: themeColor },
              ]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {cat === 'all' ? 'All' : cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColor} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>💡</Text>
          <Text style={styles.emptyTitle}>No tips yet</Text>
          <Text style={styles.emptySubtitle}>Relationship tips will appear here</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColor} />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((tip) => (
            <AnimatedPressable
              key={tip.id}
              onPress={() => {
                console.log('[Tips] Tip pressed:', tip.id);
                router.push(`/tip-detail/${tip.id}`);
              }}
            >
              <TipCard tip={tip} themeColor={themeColor} />
            </AnimatedPressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filtersScroll: { maxHeight: 52 },
  filtersRow: { paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,157,0.3)',
    backgroundColor: COLORS.card,
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
});
