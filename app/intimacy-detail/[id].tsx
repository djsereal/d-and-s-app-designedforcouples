import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet, authenticatedDelete } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface IntimacyEntry {
  id: string;
  prompt: string;
  content: string;
  type: string;
  created_at?: string;
  author_name?: string;
  author_id?: string;
}

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

function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? COLORS.primary;
}

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

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

export default function IntimacyDetailScreen() {
  const { themeColor } = useTogetherTheme();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [entry, setEntry] = useState<IntimacyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    console.log('[IntimacyDetail] Loading entry:', id);
    authenticatedGet<IntimacyEntry[]>('/api/intimacy')
      .then((items) => {
        const found = Array.isArray(items) ? items.find((e) => e.id === id) : null;
        if (found) {
          setEntry(found);
        } else {
          setError('Entry not found.');
        }
      })
      .catch((e) => {
        console.error('[IntimacyDetail] Load error:', e);
        setError('Failed to load entry.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const userId = (user as any)?.id ?? '';
  const isOwn = entry?.author_id === userId;
  const color = typeColor(entry?.type ?? '');
  const label = typeLabel(entry?.type ?? '');
  const dateDisplay = formatDate(entry?.created_at);

  const handleDelete = async () => {
    if (!id) return;
    console.log('[IntimacyDetail] Deleting entry:', id);
    setShowDeleteModal(false);
    try {
      await authenticatedDelete(`/api/intimacy/${id}`);
      console.log('[IntimacyDetail] Entry deleted, going back');
      router.back();
    } catch (e) {
      console.error('[IntimacyDetail] Delete error:', e);
      setError('Failed to delete entry.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom header */}
      <View style={styles.navBar}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={COLORS.text} />
        </AnimatedPressable>
        <Text style={styles.navTitle}>Entry</Text>
        {isOwn ? (
          <View style={styles.navActions}>
            <AnimatedPressable
              onPress={() => {
                console.log('[IntimacyDetail] Edit pressed');
                router.push({
                  pathname: '/add-intimacy',
                  params: {
                    entryId: entry?.id,
                    promptText: entry?.prompt,
                    promptType: entry?.type,
                    existingContent: entry?.content,
                  },
                });
              }}
              style={styles.navBtn}
            >
              <Pencil size={18} color={color} />
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => {
                console.log('[IntimacyDetail] Delete pressed');
                setShowDeleteModal(true);
              }}
              style={styles.navBtn}
            >
              <Trash2 size={18} color="#FF4444" />
            </AnimatedPressable>
          </View>
        ) : (
          <View style={styles.navActions} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={themeColor} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : entry ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Prompt header card */}
          <View style={[styles.promptCard, { backgroundColor: color }]}>
            <View style={[styles.typeBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={styles.typeBadgeText}>{label}</Text>
            </View>
            <Text style={styles.promptText}>{entry.prompt}</Text>
          </View>

          {/* Author + date */}
          <View style={styles.metaRow}>
            <View style={[styles.avatar, { backgroundColor: color }]}>
              <Text style={styles.avatarText}>
                {(entry.author_name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{entry.author_name ?? 'Partner'}</Text>
              <Text style={styles.date}>{dateDisplay}</Text>
            </View>
          </View>

          {/* Content card */}
          <View style={[styles.contentCard, { borderLeftColor: color }]}>
            <Text style={styles.contentText}>{entry.content}</Text>
          </View>
        </ScrollView>
      ) : null}

      <ConfirmDeleteModal
        visible={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  navActions: { flexDirection: 'row', gap: 8, width: 88, justifyContent: 'flex-end' },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  promptCard: {
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    gap: 12,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  } as any,
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  typeBadgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  promptText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF', lineHeight: 26 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  authorName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  date: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  contentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  } as any,
  contentText: { fontSize: 16, color: COLORS.text, lineHeight: 26 },
  errorText: { fontSize: 16, color: '#FF4444' },
});
