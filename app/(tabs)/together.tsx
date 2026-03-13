import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Switch,
  Modal,
  TextInput,
  LayoutAnimation,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet, authenticatedPost, authenticatedPut } from '@/utils/api';
import { COLORS, MOOD_MAP, MOODS, TODO_CATEGORIES } from '@/constants/Together';
import { MoodBadge } from '@/components/MoodBadge';
import { GoalCard } from '@/components/GoalCard';
import { TodoItem } from '@/components/TodoItem';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Plus } from 'lucide-react-native';

type Tab = 'vents' | 'moods' | 'todos' | 'goals';

interface Vent {
  id: string;
  content: string;
  mood: string;
  shared: boolean;
  user_id: string;
  created_at: string;
}

interface MoodEntry {
  id: string;
  mood: string;
  note?: string;
  user_id: string;
  created_at: string;
}

interface Todo {
  id: string;
  title: string;
  category: string;
  assigned_to?: string;
  due_date?: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  progress: number;
  target_date?: string;
}

export default function TogetherScreen() {
  const { user } = useAuth();
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<Tab>('vents');
  const [vents, setVents] = useState<Vent[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mood log modal
  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [savingMood, setSavingMood] = useState(false);

  const fetchAll = useCallback(async () => {
    console.log('[Together] Fetching all data');
    try {
      const [ventsRes, moodsRes, todosRes, goalsRes] = await Promise.all([
        authenticatedGet<Vent[]>('/api/vents').catch(() => []),
        authenticatedGet<MoodEntry[]>('/api/moods').catch(() => []),
        authenticatedGet<Todo[]>('/api/todos').catch(() => []),
        authenticatedGet<Goal[]>('/api/goals').catch(() => []),
      ]);
      setVents(Array.isArray(ventsRes) ? ventsRes : []);
      setMoods(Array.isArray(moodsRes) ? moodsRes : []);
      setTodos(Array.isArray(todosRes) ? todosRes : []);
      setGoals(Array.isArray(goalsRes) ? goalsRes : []);
    } catch (e) {
      console.error('[Together] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = () => {
    console.log('[Together] Pull to refresh');
    setRefreshing(true);
    fetchAll();
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    console.log('[Together] Toggle todo:', id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await authenticatedPut(`/api/todos/${id}`, { completed: !todo.completed });
    } catch (e) {
      console.error('[Together] Toggle todo error:', e);
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: todo.completed } : t));
    }
  };

  const handleLogMood = async () => {
    if (!selectedMood) return;
    console.log('[Together] Log mood:', selectedMood, moodNote);
    setSavingMood(true);
    try {
      await authenticatedPost('/api/moods', { mood: selectedMood, note: moodNote });
      setMoodModalVisible(false);
      setSelectedMood('');
      setMoodNote('');
      fetchAll();
    } catch (e) {
      console.error('[Together] Log mood error:', e);
    } finally {
      setSavingMood(false);
    }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: 'vents', label: 'Vents' },
    { key: 'moods', label: 'Moods' },
    { key: 'todos', label: 'To-Dos' },
    { key: 'goals', label: 'Goals' },
  ];

  const groupedTodos = TODO_CATEGORIES.map((cat) => ({
    ...cat,
    items: todos.filter((t) => t.category === cat.key),
  })).filter((g) => g.items.length > 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const getFabAction = () => {
    switch (activeTab) {
      case 'vents': return () => { console.log('[Together] FAB add vent'); router.push('/add-vent'); };
      case 'moods': return () => { console.log('[Together] FAB log mood'); setMoodModalVisible(true); };
      case 'todos': return () => { console.log('[Together] FAB add todo'); router.push('/add-todo'); };
      case 'goals': return () => { console.log('[Together] FAB add goal'); router.push('/add-goal'); };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Together 💑</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                console.log('[Together] Tab pressed:', tab.key);
                setActiveTab(tab.key);
              }}
              style={[styles.segment, isActive && { backgroundColor: themeColor }]}
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
          {/* VENTS TAB */}
          {activeTab === 'vents' && (
            <>
              {vents.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>💬</Text>
                  <Text style={styles.emptyTitle}>No vents yet</Text>
                  <Text style={styles.emptySubtitle}>Share what's on your mind</Text>
                </View>
              ) : (
                vents.map((v) => {
                  const moodInfo = MOOD_MAP[v.mood] || { emoji: '😐', color: '#90A4AE' };
                  const dateDisplay = new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const isOwn = v.user_id === user?.id;
                  return (
                    <AnimatedPressable
                      key={v.id}
                      onPress={() => {
                        console.log('[Together] Vent pressed:', v.id);
                        router.push({ pathname: '/add-vent', params: { id: v.id } });
                      }}
                      style={styles.ventCard}
                    >
                      <View style={styles.ventHeader}>
                        <Text style={styles.ventEmoji}>{moodInfo.emoji}</Text>
                        <View style={styles.ventMeta}>
                          <Text style={styles.ventOwner}>{isOwn ? 'You' : 'Partner'}</Text>
                          <Text style={styles.ventDate}>{dateDisplay}</Text>
                        </View>
                        {v.shared ? (
                          <View style={styles.sharedBadge}>
                            <Text style={styles.sharedText}>💬 Shared</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.ventContent} numberOfLines={3}>{v.content}</Text>
                    </AnimatedPressable>
                  );
                })
              )}
            </>
          )}

          {/* MOODS TAB */}
          {activeTab === 'moods' && (
            <>
              {/* 7-day chart */}
              <View style={styles.moodChart}>
                <Text style={styles.chartTitle}>Last 7 Days</Text>
                <View style={styles.chartRow}>
                  {last7Days.map((day) => {
                    const dayMoods = moods.filter((m) => m.created_at?.startsWith(day));
                    const dayLabel = new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <View key={day} style={styles.chartDay}>
                        <View style={styles.chartDots}>
                          {dayMoods.slice(0, 2).map((m, i) => {
                            const info = MOOD_MAP[m.mood] || { emoji: '😐', color: '#90A4AE' };
                            return (
                              <View key={i} style={[styles.chartDot, { backgroundColor: info.color }]}>
                                <Text style={styles.chartDotEmoji}>{info.emoji}</Text>
                              </View>
                            );
                          })}
                          {dayMoods.length === 0 ? (
                            <View style={[styles.chartDot, { backgroundColor: '#F0E0E8' }]} />
                          ) : null}
                        </View>
                        <Text style={styles.chartDayLabel}>{dayLabel}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Mood list */}
              {moods.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>😊</Text>
                  <Text style={styles.emptyTitle}>No moods logged yet</Text>
                  <Text style={styles.emptySubtitle}>Track how you're both feeling</Text>
                </View>
              ) : (
                moods.map((m) => {
                  const info = MOOD_MAP[m.mood] || { emoji: '😐', color: '#90A4AE', label: m.mood };
                  const isOwn = m.user_id === user?.id;
                  const initial = isOwn ? (user?.name?.[0] || 'Y') : 'P';
                  const dateDisplay = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <View key={m.id} style={styles.moodEntry}>
                      <View style={[styles.moodAvatar, { backgroundColor: themeColor + '22' }]}>
                        <Text style={[styles.moodAvatarText, { color: themeColor }]}>{initial}</Text>
                      </View>
                      <View style={styles.moodEntryContent}>
                        <MoodBadge mood={m.mood} size="sm" />
                        {m.note ? <Text style={styles.moodEntryNote} numberOfLines={2}>{m.note}</Text> : null}
                      </View>
                      <Text style={styles.moodEntryDate}>{dateDisplay}</Text>
                    </View>
                  );
                })
              )}
            </>
          )}

          {/* TODOS TAB */}
          {activeTab === 'todos' && (
            <>
              {todos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>✅</Text>
                  <Text style={styles.emptyTitle}>No to-dos yet</Text>
                  <Text style={styles.emptySubtitle}>Add tasks to tackle together</Text>
                </View>
              ) : (
                groupedTodos.map((group) => (
                  <View key={group.key} style={styles.todoGroup}>
                    <Text style={styles.todoGroupTitle}>{group.emoji} {group.label}</Text>
                    {group.items.map((t) => (
                      <TodoItem
                        key={t.id}
                        todo={t}
                        onToggle={handleToggleTodo}
                        themeColor={themeColor}
                        currentUserId={user?.id}
                      />
                    ))}
                  </View>
                ))
              )}
            </>
          )}

          {/* GOALS TAB */}
          {activeTab === 'goals' && (
            <>
              {goals.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🎯</Text>
                  <Text style={styles.emptyTitle}>No goals yet</Text>
                  <Text style={styles.emptySubtitle}>Set goals to grow together</Text>
                </View>
              ) : (
                goals.map((g) => (
                  <AnimatedPressable
                    key={g.id}
                    onPress={() => {
                      console.log('[Together] Goal pressed:', g.id);
                      router.push({ pathname: '/add-goal', params: { id: g.id } });
                    }}
                  >
                    <GoalCard goal={g} themeColor={themeColor} />
                  </AnimatedPressable>
                ))
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <AnimatedPressable
        onPress={getFabAction()}
        style={[styles.fab, { backgroundColor: themeColor }]}
      >
        <Plus size={28} color="#FFFFFF" />
      </AnimatedPressable>

      {/* Mood Log Modal */}
      <Modal visible={moodModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>How are you feeling?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map((m) => {
                const info = MOOD_MAP[m];
                const isSelected = selectedMood === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      console.log('[Together] Mood selected:', m);
                      setSelectedMood(m);
                    }}
                    style={[
                      styles.moodOption,
                      { borderColor: isSelected ? info.color : 'transparent', backgroundColor: isSelected ? info.color + '22' : '#FFF5F8' },
                    ]}
                  >
                    <Text style={styles.moodOptionEmoji}>{info.emoji}</Text>
                    <Text style={[styles.moodOptionLabel, { color: isSelected ? info.color : COLORS.textSecondary }]}>{info.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              style={styles.moodNoteInput}
              placeholder="Add a note (optional)"
              placeholderTextColor="#C4A0B5"
              value={moodNote}
              onChangeText={setMoodNote}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setMoodModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <AnimatedPressable
                onPress={handleLogMood}
                style={[styles.modalSaveBtn, { backgroundColor: themeColor }, !selectedMood && styles.disabledBtn]}
                disabled={!selectedMood || savingMood}
              >
                <Text style={styles.modalSaveText}>{savingMood ? 'Saving...' : 'Log Mood'}</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFE4EF',
    borderRadius: 14,
    padding: 4,
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  segmentTextActive: { color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center' },
  ventCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 12px rgba(255,107,157,0.12)',
  } as any,
  ventHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  ventEmoji: { fontSize: 24 },
  ventMeta: { flex: 1 },
  ventOwner: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  ventDate: { fontSize: 12, color: COLORS.textSecondary },
  sharedBadge: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  sharedText: { fontSize: 11, color: '#1976D2', fontWeight: '600' },
  ventContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  moodChart: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 12px rgba(255,107,157,0.12)',
  } as any,
  chartTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 12 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between' },
  chartDay: { alignItems: 'center', gap: 6 },
  chartDots: { gap: 4, alignItems: 'center' },
  chartDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chartDotEmoji: { fontSize: 14 },
  chartDayLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' },
  moodEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    boxShadow: '0 1px 6px rgba(255,107,157,0.08)',
  } as any,
  moodAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  moodAvatarText: { fontSize: 16, fontWeight: '700' },
  moodEntryContent: { flex: 1, gap: 4 },
  moodEntryNote: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  moodEntryDate: { fontSize: 12, color: COLORS.textSecondary },
  todoGroup: { marginBottom: 16 },
  todoGroupTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 20, textAlign: 'center' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  moodOption: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    gap: 4,
  },
  moodOptionEmoji: { fontSize: 24 },
  moodOptionLabel: { fontSize: 11, fontWeight: '600' },
  moodNoteInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 16,
    minHeight: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F5E6EC',
  },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSaveText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  disabledBtn: { opacity: 0.5 },
});
