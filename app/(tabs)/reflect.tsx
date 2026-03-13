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
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import { COLORS, REFLECTION_TYPES } from '@/constants/Together';
import { ReflectionCard } from '@/components/ReflectionCard';
import { ReminderBanner } from '@/components/ReminderBanner';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Plus } from 'lucide-react-native';

interface Reflection {
  id: string;
  title: string;
  type: string;
  content: string;
  created_at?: string;
  shared?: boolean;
}

interface Reminder {
  id: string;
  message?: string;
  title?: string;
  acknowledged?: boolean;
}

export default function ReflectScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    console.log('[Reflect] Fetching reflections and reminders');
    try {
      const [reflRes, remRes] = await Promise.all([
        authenticatedGet<Reflection[]>('/api/reflections').catch(() => []),
        authenticatedGet<Reminder[]>('/api/reflection-reminders').catch(() => []),
      ]);
      setReflections(Array.isArray(reflRes) ? reflRes : []);
      const unacked = Array.isArray(remRes) ? remRes.filter((r) => !r.acknowledged) : [];
      setReminders(unacked);
    } catch (e) {
      console.error('[Reflect] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    console.log('[Reflect] Pull to refresh');
    setRefreshing(true);
    fetchData();
  };

  const handleAcknowledge = async (id: string) => {
    console.log('[Reflect] Acknowledge reminder:', id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    try {
      await authenticatedPost(`/api/reflection-reminders/${id}/acknowledge`, {});
    } catch (e) {
      console.error('[Reflect] Acknowledge error:', e);
    }
  };

  const filters = [
    { key: 'all', label: 'All' },
    ...REFLECTION_TYPES.map((t) => ({ key: t.key, label: t.label })),
  ];

  const filtered = activeFilter === 'all'
    ? reflections
    : reflections.filter((r) => r.type === activeFilter);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Reflect 📖</Text>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersScroll}
      >
        {filters.map((f) => {
          const isActive = activeFilter === f.key;
          const typeInfo = REFLECTION_TYPES.find((t) => t.key === f.key);
          const color = typeInfo?.color || themeColor;
          return (
            <Pressable
              key={f.key}
              onPress={() => {
                console.log('[Reflect] Filter pressed:', f.key);
                setActiveFilter(f.key);
              }}
              style={[
                styles.filterChip,
                isActive && { backgroundColor: color, borderColor: color },
              ]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColor} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColor} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Reminder banners */}
          {reminders.map((r) => (
            <ReminderBanner
              key={r.id}
              reminder={r}
              onAcknowledge={handleAcknowledge}
              themeColor={themeColor}
            />
          ))}

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>No reflections yet</Text>
              <Text style={styles.emptySubtitle}>Start journaling your relationship journey</Text>
              <AnimatedPressable
                onPress={() => {
                  console.log('[Reflect] Add first reflection pressed');
                  router.push('/add-reflection');
                }}
                style={[styles.emptyBtn, { backgroundColor: themeColor }]}
              >
                <Text style={styles.emptyBtnText}>Write First Reflection</Text>
              </AnimatedPressable>
            </View>
          ) : (
            filtered.map((r) => (
              <AnimatedPressable
                key={r.id}
                onPress={() => {
                  console.log('[Reflect] Reflection pressed:', r.id);
                  router.push({ pathname: '/add-reflection', params: { id: r.id } });
                }}
              >
                <ReflectionCard reflection={r} />
              </AnimatedPressable>
            ))
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <AnimatedPressable
        onPress={() => {
          console.log('[Reflect] FAB add reflection pressed');
          router.push('/add-reflection');
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  emptyBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  emptyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
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
