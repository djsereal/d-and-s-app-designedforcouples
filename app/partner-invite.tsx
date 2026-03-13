import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTogetherTheme } from '@/contexts/ThemeContext';
import { authenticatedGet, authenticatedPost } from '@/utils/api';
import { COLORS } from '@/constants/Together';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clipboard } from 'react-native';

interface Couple {
  id: string;
  name: string;
  anniversary_date?: string;
  invite_code?: string;
}

export default function PartnerInviteScreen() {
  const { themeColor } = useTogetherTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create couple form
  const [coupleName, setCoupleName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchCouple = useCallback(async () => {
    console.log('[PartnerInvite] Fetching couple');
    try {
      const res = await authenticatedGet<Couple>('/api/couples/me').catch(() => null);
      setCouple(res);
    } catch (e) {
      console.error('[PartnerInvite] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCouple(); }, [fetchCouple]);

  const handleCopyCode = async () => {
    if (!couple?.invite_code) return;
    console.log('[PartnerInvite] Copy invite code pressed');
    try {
      Clipboard.setString(couple.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('[PartnerInvite] Copy error:', e);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    console.log('[PartnerInvite] Join with code pressed:', joinCode);
    setJoining(true);
    setError('');
    try {
      await authenticatedPost('/api/couples/join', { invite_code: joinCode.trim() });
      fetchCouple();
    } catch (e: any) {
      console.error('[PartnerInvite] Join error:', e);
      setError(e?.message || 'Invalid invite code. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleCreate = async () => {
    if (!coupleName.trim()) {
      setError('Please enter a couple name');
      return;
    }
    console.log('[PartnerInvite] Create couple pressed:', coupleName);
    setCreating(true);
    setError('');
    try {
      await authenticatedPost('/api/couples', {
        name: coupleName.trim(),
        anniversary_date: anniversaryDate.toISOString().split('T')[0],
      });
      fetchCouple();
    } catch (e: any) {
      console.error('[PartnerInvite] Create error:', e);
      setError(e?.message || 'Failed to create couple profile.');
    } finally {
      setCreating(false);
    }
  };

  const dateLabel = anniversaryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={themeColor} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      {couple ? (
        <>
          {/* Show invite code */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Invite Code</Text>
            <Text style={styles.sectionSubtitle}>Share this code with your partner so they can join</Text>
            <View style={[styles.codeBox, { borderColor: themeColor + '44' }]}>
              <Text style={[styles.codeText, { color: themeColor }]}>{couple.invite_code || '—'}</Text>
            </View>
            <AnimatedPressable
              onPress={handleCopyCode}
              style={[styles.copyBtn, { backgroundColor: themeColor }]}
            >
              <Text style={styles.copyBtnText}>{copied ? '✓ Copied!' : '📋 Copy Code'}</Text>
            </AnimatedPressable>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or join partner</Text>
            <View style={styles.dividerLine} />
          </View>
        </>
      ) : (
        <>
          {/* Create couple form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create Couple Profile 💑</Text>
            <Text style={styles.sectionSubtitle}>Set up your shared profile to start tracking your journey</Text>
            <Text style={styles.label}>Couple Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John & Jane"
              placeholderTextColor="#C4A0B5"
              value={coupleName}
              onChangeText={setCoupleName}
            />
            <Text style={styles.label}>Anniversary Date</Text>
            <Pressable
              onPress={() => {
                console.log('[PartnerInvite] Date picker pressed');
                setShowDatePicker(true);
              }}
              style={styles.datePicker}
            >
              <Text style={styles.datePickerText}>📅 {dateLabel}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={anniversaryDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setAnniversaryDate(date);
                }}
                maximumDate={new Date()}
              />
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <AnimatedPressable
              onPress={handleCreate}
              style={[styles.primaryBtn, { backgroundColor: themeColor }, creating && styles.disabledBtn]}
              disabled={creating}
            >
              <Text style={styles.primaryBtnText}>{creating ? 'Creating...' : 'Create Profile'}</Text>
            </AnimatedPressable>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or join with code</Text>
            <View style={styles.dividerLine} />
          </View>
        </>
      )}

      {/* Join with code */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join with Invite Code</Text>
        <Text style={styles.sectionSubtitle}>Enter your partner's invite code to connect</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter invite code"
          placeholderTextColor="#C4A0B5"
          value={joinCode}
          onChangeText={setJoinCode}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error && !couple ? null : error ? <Text style={styles.errorText}>{error}</Text> : null}
        <AnimatedPressable
          onPress={handleJoin}
          style={[styles.primaryBtn, { backgroundColor: themeColor }, joining && styles.disabledBtn]}
          disabled={joining || !joinCode.trim()}
        >
          <Text style={styles.primaryBtnText}>{joining ? 'Joining...' : 'Join Partner'}</Text>
        </AnimatedPressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  sectionSubtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 20 },
  codeBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeText: { fontSize: 32, fontWeight: '800', letterSpacing: 4 },
  copyBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  copyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,107,157,0.2)' },
  dividerText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  datePicker: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,107,157,0.2)',
  },
  datePickerText: { fontSize: 16, color: COLORS.text },
  errorText: { color: '#FF4444', fontSize: 13, marginBottom: 12 },
  primaryBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  disabledBtn: { opacity: 0.7 },
});
