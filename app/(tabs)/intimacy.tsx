import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet, authenticatedDelete } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Prompt {
  id: string;
  text: string;
  type: string;
}

interface IntimacyEntry {
  id: string;
  prompt: string;
  content: string;
  type: string;
  created_at?: string;
  author_name?: string;
  author_id?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  fantasy:      '#9C27B0',
  feedback:     '#E91E63',
  try_it:       '#FF5722',
  appreciation: '#F06292',
  desire:       '#C2185B',
};

const TYPE_LABELS: Record<string, string> = {
  fantasy:      'Fantasy 💜',
  feedback:     'Feedback 💗',
  try_it:       'Try It 🔥',
  appreciation: 'Appreciation 🌸',
  desire:       'Desire 💋',
};

const CATEGORY_FILTERS = [
  { key: 'all',         label: 'All' },
  { key: 'fantasy',     label: 'Fantasy' },
  { key: 'feedback',    label: 'Feedback' },
  { key: 'try_it',      label: 'Try It' },
  { key: 'appreciation',label: 'Appreciation' },
  { key: 'desire',      label: 'Desire' },
];

function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? COLORS.primary;
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const color = typeColor(type);
  const label = typeLabel(type);
  return (
    <View style={[badgeStyles.pill, { backgroundColor: color }]}>
      <Text style={badgeStyles.text}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
});

function PromptCard({ prompt, onPress }: { prompt: Prompt; onPress: () => void }) {
  const color = typeColor(prompt.type);
  return (
    <AnimatedPressable onPress={onPress} style={[promptStyles.card, { borderLeftColor: color }]}>
      <TypeBadge type={prompt.type} />
      <Text style={promptStyles.text}>{prompt.text}</Text>
    </AnimatedPressable>
  );
}

const promptStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    gap: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  } as any,
  text: { fontSize: 15, color: COLORS.text, fontWeight: '500', lineHeight: 22 },
});

function EntryCard({
  entry,
  isOwn,
  onPress,
  onEdit,
  onDelete,
}: {
  entry: IntimacyEntry;
  isOwn: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = typeColor(entry.type);
  const tint = color + '14'; // ~8% opacity
  const initial = (entry.author_name ?? 'U').charAt(0).toUpperCase();
  const dateDisplay = formatDate(entry.created_at);
  const contentPreview = entry.content.length > 120 ? entry.content.slice(0, 120) + '…' : entry.content;

  return (
    <AnimatedPressable onPress={onPress} style={[entryStyles.card, { backgroundColor: tint, borderColor: color + '30' }]}>
      <View style={entryStyles.row}>
        <View style={[entryStyles.avatar, { backgroundColor: color }]}>
          <Text style={entryStyles.avatarText}>{initial}</Text>
        </View>
        <View style={entryStyles.meta}>
          <Text style={entryStyles.authorName}>{entry.author_name ?? 'Partner'}</Text>
          <Text style={entryStyles.date}>{dateDisplay}</Text>
        </View>
        <TypeBadge type={entry.type} />
      </View>
      <Text style={entryStyles.prompt} numberOfLines={1}>{entry.prompt}</Text>
      <Text style={entryStyles.content} numberOfLines={2}>{contentPreview}</Text>
      {isOwn && (
        <View style={entryStyles.actions}>
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            style={[entryStyles.actionBtn, { backgroundColor: color + '22' }]}
          >
            <Pencil size={14} color={color} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={[entryStyles.actionBtn, { backgroundColor: '#FF444422' }]}
          >
            <Trash2 size={14} color="#FF4444" />
          </Pressable>
        </View>
      )}
    </AnimatedPressable>
  );
}

const entryStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  } as any,
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  meta: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  date: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  prompt: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, fontStyle: 'italic' },
  content: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.box}>
          <Text style={modalStyles.title}>Delete Entry?</Text>
          <Text style={modalStyles.body}>This will permanently remove your intimate entry.</Text>
          <View style={modalStyles.btnRow}>
            <Pressable onPress={onCancel} style={[modalStyles.btn, modalStyles.cancelBtn]}>
              <Text style={modalStyles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[modalStyles.btn, modalStyles.deleteBtn]}>
              <Text style={modalStyles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  box: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  cancelBtn: { backgroundColor: COLORS.inputBg },
  deleteBtn: { backgroundColor: '#FF4444' },
  cancelText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  deleteText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function IntimacyScreen() {
  const { themeColor } = useTogetherTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeSection, setActiveSection] = useState<'prompts' | 'entries'>('prompts');
  const [activeFilter, setActiveFilter] = useState('all');

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [entries, setEntries] = useState<IntimacyEntry[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    console.log('[Intimacy] Fetching prompts');
    try {
      const res = await authenticatedGet<Prompt[]>('/api/intimacy/prompts');
      setPrompts(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('[Intimacy] Fetch prompts error:', e);
    } finally {
      setLoadingPrompts(false);
    }
  }, []);

  const fetchEntries = useCallback(async () => {
    console.log('[Intimacy] Fetching entries');
    try {
      const res = await authenticatedGet<IntimacyEntry[]>('/api/intimacy');
      setEntries(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('[Intimacy] Fetch entries error:', e);
    } finally {
      setLoadingEntries(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
    fetchEntries();
  }, [fetchPrompts, fetchEntries]);

  const onRefresh = () => {
    console.log('[Intimacy] Pull to refresh');
    setRefreshing(true);
    fetchEntries();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    console.log('[Intimacy] Delete entry:', deleteTarget);
    const id = deleteTarget;
    setDeleteTarget(null);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await authenticatedDelete(`/api/intimacy/${id}`);
    } catch (e) {
      console.error('[Intimacy] Delete error:', e);
      fetchEntries();
    }
  };

  const filteredPrompts = activeFilter === 'all'
    ? prompts
    : prompts.filter((p) => p.type === activeFilter);

  const userId = (user as any)?.id ?? '';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Intimacy 🔥</Text>
        <Text style={styles.subtitle}>Your private romantic space</Text>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentWrapper}>
        <View style={styles.segment}>
          <Pressable
            onPress={() => {
              console.log('[Intimacy] Section: prompts');
              setActiveSection('prompts');
            }}
            style={[styles.segBtn, activeSection === 'prompts' && { backgroundColor: themeColor }]}
          >
            <Text style={[styles.segBtnText, activeSection === 'prompts' && styles.segBtnTextActive]}>
              Prompts
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              console.log('[Intimacy] Section: entries');
              setActiveSection('entries');
            }}
            style={[styles.segBtn, activeSection === 'entries' && { backgroundColor: themeColor }]}
          >
            <Text style={[styles.segBtnText, activeSection === 'entries' && styles.segBtnTextActive]}>
              Our Entries
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Prompts section */}
      {activeSection === 'prompts' && (
        <>
          {/* Category filter pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
            style={styles.filtersScroll}
          >
            {CATEGORY_FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              const color = f.key === 'all' ? themeColor : typeColor(f.key);
              return (
                <Pressable
                  key={f.key}
                  onPress={() => {
                    console.log('[Intimacy] Filter pressed:', f.key);
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

          {loadingPrompts ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={themeColor} />
            </View>
          ) : filteredPrompts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔥</Text>
              <Text style={styles.emptyTitle}>No prompts yet</Text>
              <Text style={styles.emptySubtitle}>Check back soon for new intimate prompts</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredPrompts.map((p) => (
                <PromptCard
                  key={p.id}
                  prompt={p}
                  onPress={() => {
                    console.log('[Intimacy] Prompt selected:', p.id, p.type);
                    router.push({
                      pathname: '/add-intimacy',
                      params: { promptId: p.id, promptText: p.text, promptType: p.type },
                    });
                  }}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Entries section */}
      {activeSection === 'entries' && (
        <>
          {loadingEntries ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={themeColor} />
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔥</Text>
              <Text style={styles.emptyTitle}>Your intimate space is empty</Text>
              <Text style={styles.emptySubtitle}>Pick a prompt to begin 🔥</Text>
              <AnimatedPressable
                onPress={() => {
                  console.log('[Intimacy] Empty state: go to prompts');
                  setActiveSection('prompts');
                }}
                style={[styles.emptyBtn, { backgroundColor: themeColor }]}
              >
                <Text style={styles.emptyBtnText}>Browse Prompts</Text>
              </AnimatedPressable>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColor} />
              }
              showsVerticalScrollIndicator={false}
            >
              {entries.map((entry) => {
                const isOwn = entry.author_id === userId;
                return (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    isOwn={isOwn}
                    onPress={() => {
                      console.log('[Intimacy] Entry pressed:', entry.id);
                      router.push({ pathname: '/intimacy-detail/[id]', params: { id: entry.id } });
                    }}
                    onEdit={() => {
                      console.log('[Intimacy] Edit entry:', entry.id);
                      router.push({
                        pathname: '/add-intimacy',
                        params: {
                          entryId: entry.id,
                          promptText: entry.prompt,
                          promptType: entry.type,
                          existingContent: entry.content,
                        },
                      });
                    }}
                    onDelete={() => {
                      console.log('[Intimacy] Delete pressed for entry:', entry.id);
                      setDeleteTarget(entry.id);
                    }}
                  />
                );
              })}
            </ScrollView>
          )}
        </>
      )}

      <ConfirmDeleteModal
        visible={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    background: 'linear-gradient(135deg, #9C27B0 0%, #C2185B 100%)',
  } as any,
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  segmentWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  segment: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  segBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  segBtnTextActive: { color: '#FFFFFF' },
  filtersScroll: { maxHeight: 52 },
  filtersRow: { paddingHorizontal: 20, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(156,39,176,0.25)',
    backgroundColor: COLORS.card,
  },
  filterChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterChipTextActive: { color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  emptyBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  emptyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
