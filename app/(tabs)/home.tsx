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
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import { COLORS, MOOD_MAP } from '@/constants/Together';
import { MoodBadge } from '@/components/MoodBadge';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Heart, Camera, BookOpen, MessageCircle, Bell } from 'lucide-react-native';

interface Couple {
  id: string;
  name: string;
  anniversary_date?: string;
  invite_code?: string;
}

interface Mood {
  id: string;
  mood: string;
  note?: string;
  user_id: string;
  created_at: string;
}

interface Memory {
  id: string;
  prompt: string;
  image_url?: string;
  caption?: string;
  date?: string;
}

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

function calcAnniversary(dateStr: string) {
  const start = new Date(dateStr);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { themeColor, themeFont } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [couple, setCouple] = useState<Couple | null>(null);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [anniversary, setAnniversary] = useState({ years: 0, months: 0, days: 0 });
  const [reminderSent, setReminderSent] = useState(false);

  const fetchData = useCallback(async () => {
    console.log('[Home] Fetching home data');
    try {
      const [coupleRes, moodsRes, memoriesRes, todosRes] = await Promise.all([
        authenticatedGet('/api/couples/me').catch(() => null),
        authenticatedGet('/api/moods').catch(() => []),
        authenticatedGet('/api/memories').catch(() => []),
        authenticatedGet('/api/todos').catch(() => []),
      ]);
      setCouple(coupleRes);
      setMoods(Array.isArray(moodsRes) ? moodsRes : []);
      setMemories(Array.isArray(memoriesRes) ? memoriesRes.slice(0, 3) : []);
      setTodos(Array.isArray(todosRes) ? todosRes.slice(0, 3) : []);
    } catch (e) {
      console.error('[Home] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!couple?.anniversary_date) return;
    const update = () => setAnniversary(calcAnniversary(couple.anniversary_date!));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [couple?.anniversary_date]);

  const onRefresh = () => {
    console.log('[Home] Pull to refresh');
    setRefreshing(true);
    fetchData();
  };

  const sendReminder = async () => {
    console.log('[Home] Send reflection reminder pressed');
    try {
      await authenticatedPost('/api/reflection-reminders', { message: 'Time to reflect on our relationship 💕' });
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    } catch (e) {
      console.error('[Home] Send reminder error:', e);
    }
  };

  const partnerMood = moods.find((m) => m.user_id !== user?.id);
  const myMood = moods.find((m) => m.user_id === user?.id);
  const userName = user?.name || user?.email?.split('@')[0] || 'You';
  const coupleName = couple?.name || 'Your Couple';

  const anniversaryText = couple?.anniversary_date
    ? `💑 ${anniversary.years}y ${anniversary.months}m ${anniversary.days}d together`
    : null;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={themeColor} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColor} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Gradient */}
        <LinearGradient
          colors={[themeColor, themeColor + 'CC', '#FFF5F8']}
          style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
        >
          {couple ? (
            <>
              <Text style={styles.coupleName}>{coupleName} 💕</Text>
              {anniversaryText ? (
                <View style={styles.anniversaryBadge}>
                  <Text style={styles.anniversaryText}>{anniversaryText}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.coupleName}>Welcome, {userName} 👋</Text>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* No couple onboarding */}
          {!couple ? (
            <View style={styles.onboardingCard}>
              <Text style={styles.onboardingEmoji}>💑</Text>
              <Text style={styles.onboardingTitle}>Start Your Journey Together</Text>
              <Text style={styles.onboardingSubtitle}>
                Create a couple profile or join your partner with an invite code
              </Text>
              <AnimatedPressable
                onPress={() => {
                  console.log('[Home] Create couple profile pressed');
                  router.push('/partner-invite');
                }}
                style={[styles.onboardingBtn, { backgroundColor: themeColor }]}
              >
                <Text style={styles.onboardingBtnText}>Create Couple Profile</Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => {
                  console.log('[Home] Join with invite code pressed');
                  router.push('/partner-invite');
                }}
                style={styles.onboardingBtnOutline}
              >
                <Text style={[styles.onboardingBtnOutlineText, { color: themeColor }]}>Join with Invite Code</Text>
              </AnimatedPressable>
            </View>
          ) : null}

          {/* Partner Mood */}
          {partnerMood ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Partner's Mood</Text>
              <View style={styles.moodCard}>
                <MoodBadge mood={partnerMood.mood} size="lg" />
                {partnerMood.note ? (
                  <Text style={styles.moodNote}>{partnerMood.note}</Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <AnimatedPressable
                onPress={() => {
                  console.log('[Home] Log mood pressed');
                  router.push('/(tabs)/together');
                }}
                style={[styles.quickBtn, { backgroundColor: themeColor + '18' }]}
              >
                <Text style={styles.quickBtnEmoji}>😊</Text>
                <Text style={[styles.quickBtnLabel, { color: themeColor }]}>Log Mood</Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => {
                  console.log('[Home] Add memory pressed');
                  router.push('/add-memory');
                }}
                style={[styles.quickBtn, { backgroundColor: '#FF8E5318' }]}
              >
                <Camera size={22} color="#FF8E53" />
                <Text style={[styles.quickBtnLabel, { color: '#FF8E53' }]}>Memory</Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => {
                  console.log('[Home] Add vent pressed');
                  router.push('/add-vent');
                }}
                style={[styles.quickBtn, { backgroundColor: '#B39DDB18' }]}
              >
                <MessageCircle size={22} color="#B39DDB" />
                <Text style={[styles.quickBtnLabel, { color: '#B39DDB' }]}>Vent</Text>
              </AnimatedPressable>
              <AnimatedPressable
                onPress={() => {
                  console.log('[Home] Add reflection pressed');
                  router.push('/add-reflection');
                }}
                style={[styles.quickBtn, { backgroundColor: '#81C78418' }]}
              >
                <BookOpen size={22} color="#81C784" />
                <Text style={[styles.quickBtnLabel, { color: '#81C784' }]}>Reflect</Text>
              </AnimatedPressable>
            </View>
          </View>

          {/* Recent Memories */}
          {memories.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Recent Memories</Text>
                <Pressable onPress={() => router.push('/(tabs)/memories')}>
                  <Text style={[styles.seeAll, { color: themeColor }]}>See all</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.memoriesRow}>
                {memories.map((m) => (
                  <AnimatedPressable
                    key={m.id}
                    onPress={() => {
                      console.log('[Home] Memory pressed:', m.id);
                      router.push(`/memory-detail/${m.id}`);
                    }}
                    style={styles.memoryThumb}
                  >
                    <View style={[styles.memoryThumbImg, { backgroundColor: themeColor + '22' }]}>
                      <Text style={styles.memoryThumbEmoji}>📸</Text>
                    </View>
                    <Text style={styles.memoryThumbLabel} numberOfLines={1}>{m.prompt}</Text>
                  </AnimatedPressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Recent Todos */}
          {todos.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>To-Dos</Text>
                <Pressable onPress={() => router.push('/(tabs)/together')}>
                  <Text style={[styles.seeAll, { color: themeColor }]}>See all</Text>
                </Pressable>
              </View>
              {todos.map((t) => (
                <View key={t.id} style={styles.todoRow}>
                  <View style={[styles.todoDot, { backgroundColor: t.completed ? COLORS.success : themeColor }]} />
                  <Text style={[styles.todoTitle, t.completed && styles.todoCompleted]} numberOfLines={1}>
                    {t.title}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Send Reminder FAB */}
      <AnimatedPressable
        onPress={sendReminder}
        style={[styles.reminderFab, { backgroundColor: themeColor }]}
      >
        <Bell size={20} color="#FFFFFF" />
        <Text style={styles.reminderFabText}>{reminderSent ? 'Sent! 💕' : 'Remind'}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  headerGradient: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  coupleName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  anniversaryBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  anniversaryText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  seeAll: { fontSize: 14, fontWeight: '600' },
  onboardingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    boxShadow: '0 4px 20px rgba(255,107,157,0.15)',
  } as any,
  onboardingEmoji: { fontSize: 56, marginBottom: 12 },
  onboardingTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 8 },
  onboardingSubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  onboardingBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  onboardingBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  onboardingBtnOutline: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  onboardingBtnOutlineText: { fontSize: 16, fontWeight: '700' },
  moodCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 2px 12px rgba(255,107,157,0.12)',
  } as any,
  moodNote: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  quickActions: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickBtnEmoji: { fontSize: 22 },
  quickBtnLabel: { fontSize: 11, fontWeight: '600' },
  memoriesRow: { marginHorizontal: -4 },
  memoryThumb: { marginHorizontal: 4, alignItems: 'center', width: 80 },
  memoryThumbImg: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  memoryThumbEmoji: { fontSize: 28 },
  memoryThumbLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  todoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  todoDot: { width: 8, height: 8, borderRadius: 4 },
  todoTitle: { fontSize: 15, color: COLORS.text, flex: 1 },
  todoCompleted: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  reminderFab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 28,
    boxShadow: '0 4px 16px rgba(255,107,157,0.4)',
  } as any,
  reminderFabText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
