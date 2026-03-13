import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ChevronRight, LogOut, Heart, Palette, Users, Lightbulb } from 'lucide-react-native';

interface Couple {
  id: string;
  name: string;
  anniversary_date?: string;
  partner?: { name?: string; email?: string };
}

export default function MoreScreen() {
  const { user, signOut } = useAuth();
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    console.log('[More] Fetching couple data');
    try {
      const res = await authenticatedGet<Couple>('/api/couples/me').catch(() => null);
      setCouple(res);
    } catch (e) {
      console.error('[More] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => {
    console.log('[More] Pull to refresh');
    setRefreshing(true);
    fetchData();
  };

  const handleSignOut = async () => {
    console.log('[More] Sign out confirmed');
    setSignOutModalVisible(false);
    await signOut();
  };

  const userName = user?.name || user?.email?.split('@')[0] || 'You';
  const userInitial = userName[0]?.toUpperCase() || 'Y';
  const anniversaryDisplay = couple?.anniversary_date
    ? new Date(couple.anniversary_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColor} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>More ✨</Text>

        {/* Profile Section */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: themeColor }]}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Partner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Partner</Text>
          <View style={styles.card}>
            {couple?.partner ? (
              <View style={styles.partnerRow}>
                <View style={[styles.partnerAvatar, { backgroundColor: '#FF8E5322' }]}>
                  <Text style={[styles.partnerAvatarText, { color: '#FF8E53' }]}>
                    {(couple.partner.name || couple.partner.email || 'P')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>{couple.partner.name || 'Partner'}</Text>
                  <Text style={styles.partnerEmail}>{couple.partner.email || ''}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noPartnerRow}>
                <Text style={styles.noPartnerText}>No partner connected yet</Text>
                <AnimatedPressable
                  onPress={() => {
                    console.log('[More] Invite partner pressed');
                    router.push('/partner-invite');
                  }}
                  style={[styles.inviteBtn, { backgroundColor: themeColor }]}
                >
                  <Text style={styles.inviteBtnText}>Invite Partner</Text>
                </AnimatedPressable>
              </View>
            )}
          </View>
        </View>

        {/* Couple Section */}
        {couple ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your Couple</Text>
            <View style={styles.card}>
              <View style={styles.coupleRow}>
                <Text style={styles.coupleEmoji}>💑</Text>
                <View>
                  <Text style={styles.coupleName}>{couple.name}</Text>
                  {anniversaryDisplay ? (
                    <Text style={styles.coupleAnniversary}>Since {anniversaryDisplay}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        ) : null}

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Explore</Text>
          <View style={styles.menuCard}>
            <AnimatedPressable
              onPress={() => {
                console.log('[More] Relationship tips pressed');
                router.push('/tips');
              }}
              style={styles.menuItem}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#FFD70022' }]}>
                <Lightbulb size={20} color="#FFD700" />
              </View>
              <Text style={styles.menuLabel}>Relationship Tips</Text>
              <ChevronRight size={18} color={COLORS.textSecondary} />
            </AnimatedPressable>

            <View style={styles.menuDivider} />

            <AnimatedPressable
              onPress={() => {
                console.log('[More] Customize app pressed');
                router.push('/customization');
              }}
              style={styles.menuItem}
            >
              <View style={[styles.menuIcon, { backgroundColor: themeColor + '22' }]}>
                <Palette size={20} color={themeColor} />
              </View>
              <Text style={styles.menuLabel}>Customize App</Text>
              <ChevronRight size={18} color={COLORS.textSecondary} />
            </AnimatedPressable>

            <View style={styles.menuDivider} />

            <AnimatedPressable
              onPress={() => {
                console.log('[More] Invite partner pressed');
                router.push('/partner-invite');
              }}
              style={styles.menuItem}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#81C78422' }]}>
                <Users size={20} color="#81C784" />
              </View>
              <Text style={styles.menuLabel}>Invite Partner</Text>
              <ChevronRight size={18} color={COLORS.textSecondary} />
            </AnimatedPressable>
          </View>
        </View>

        {/* Sign Out */}
        <AnimatedPressable
          onPress={() => {
            console.log('[More] Sign out button pressed');
            setSignOutModalVisible(true);
          }}
          style={styles.signOutBtn}
        >
          <LogOut size={18} color="#FF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </AnimatedPressable>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal visible={signOutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>👋</Text>
            <Text style={styles.modalTitle}>Sign Out?</Text>
            <Text style={styles.modalSubtitle}>You'll need to sign in again to access your account.</Text>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setSignOutModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <AnimatedPressable onPress={handleSignOut} style={styles.modalConfirmBtn}>
                <Text style={styles.modalConfirmText}>Sign Out</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, paddingTop: 8, marginBottom: 20 },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    boxShadow: '0 2px 12px rgba(255,107,157,0.12)',
  } as any,
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  profileEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 2px 12px rgba(255,107,157,0.08)',
  } as any,
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  partnerAvatarText: { fontSize: 18, fontWeight: '700' },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  partnerEmail: { fontSize: 13, color: COLORS.textSecondary },
  noPartnerRow: { gap: 12 },
  noPartnerText: { fontSize: 15, color: COLORS.textSecondary },
  inviteBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start' },
  inviteBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  coupleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  coupleEmoji: { fontSize: 32 },
  coupleName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  coupleAnniversary: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  menuCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(255,107,157,0.08)',
  } as any,
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: COLORS.text },
  menuDivider: { height: 1, backgroundColor: 'rgba(255,107,157,0.1)', marginLeft: 66 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FF444418',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF444430',
  },
  signOutText: { fontSize: 16, fontWeight: '700', color: '#FF4444' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  modalSubtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#F5E6EC' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  modalConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#FF4444' },
  modalConfirmText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
