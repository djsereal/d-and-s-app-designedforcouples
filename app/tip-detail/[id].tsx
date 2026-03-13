import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ExternalLink, Bookmark } from 'lucide-react-native';

interface Tip {
  id: string;
  title: string;
  content: string;
  category?: string;
  source_url?: string;
}

export default function TipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    console.log('[TipDetail] Loading tip:', id);
    authenticatedGet<Tip[]>('/api/tips')
      .then((items) => {
        const found = Array.isArray(items) ? items.find((t) => t.id === id) : null;
        setTip(found || null);
      })
      .catch((e) => console.error('[TipDetail] Fetch error:', e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleOpenSource = () => {
    if (!tip?.source_url) return;
    console.log('[TipDetail] Open source URL pressed:', tip.source_url);
    Linking.openURL(tip.source_url).catch((e) => console.error('[TipDetail] Open URL error:', e));
  };

  const handleSave = async () => {
    console.log('[TipDetail] Save tip pressed:', id);
    setSaving(true);
    try {
      await authenticatedPost('/api/tips/save', { tip_id: id });
      setSaved(true);
    } catch (e) {
      console.error('[TipDetail] Save tip error:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={themeColor} />
      </View>
    );
  }

  if (!tip) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundEmoji}>💡</Text>
        <Text style={styles.notFoundText}>Tip not found</Text>
        <AnimatedPressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: themeColor }]}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Category badge */}
      {tip.category ? (
        <View style={[styles.catBadge, { backgroundColor: themeColor + '18' }]}>
          <Text style={[styles.catText, { color: themeColor }]}>{tip.category}</Text>
        </View>
      ) : null}

      <Text style={styles.title}>{tip.title}</Text>
      <Text style={styles.content_text}>{tip.content}</Text>

      <View style={styles.actions}>
        {tip.source_url ? (
          <AnimatedPressable
            onPress={handleOpenSource}
            style={[styles.actionBtn, { backgroundColor: '#E3F2FD', borderColor: '#1976D2' }]}
          >
            <ExternalLink size={18} color="#1976D2" />
            <Text style={[styles.actionBtnText, { color: '#1976D2' }]}>Open Source</Text>
          </AnimatedPressable>
        ) : null}

        <AnimatedPressable
          onPress={handleSave}
          style={[styles.actionBtn, { backgroundColor: themeColor + '18', borderColor: themeColor }, saved && styles.savedBtn]}
          disabled={saving || saved}
        >
          <Bookmark size={18} color={saved ? '#FFFFFF' : themeColor} />
          <Text style={[styles.actionBtnText, { color: saved ? '#FFFFFF' : themeColor }]}>
            {saved ? 'Saved! 💕' : saving ? 'Saving...' : 'Save to Our Tips'}
          </Text>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, padding: 40 },
  notFoundEmoji: { fontSize: 56, marginBottom: 12 },
  notFoundText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginBottom: 24 },
  backBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  backBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  catText: { fontSize: 13, fontWeight: '700' },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 34,
    marginBottom: 20,
  },
  content_text: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 32,
  },
  actions: { gap: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  actionBtnText: { fontSize: 15, fontWeight: '700' },
  savedBtn: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
});
