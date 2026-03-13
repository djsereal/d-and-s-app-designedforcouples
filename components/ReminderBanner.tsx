import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '@/constants/Together';
import { X } from 'lucide-react-native';

interface Reminder {
  id: string;
  message?: string;
  title?: string;
}

interface ReminderBannerProps {
  reminder: Reminder;
  onAcknowledge: (id: string) => void;
  themeColor?: string;
}

export function ReminderBanner({ reminder, onAcknowledge, themeColor = COLORS.primary }: ReminderBannerProps) {
  const message = reminder.message || reminder.title || 'Time to reflect on your relationship 💕';

  return (
    <View style={[styles.banner, { backgroundColor: themeColor + '18', borderColor: themeColor + '44' }]}>
      <Text style={styles.emoji}>🔔</Text>
      <Text style={[styles.text, { color: COLORS.text }]} numberOfLines={2}>{message}</Text>
      <Pressable
        onPress={() => {
          console.log('[ReminderBanner] Acknowledge reminder:', reminder.id);
          onAcknowledge(reminder.id);
        }}
        style={styles.closeBtn}
      >
        <X size={16} color={COLORS.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  emoji: { fontSize: 20 },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeBtn: {
    padding: 4,
  },
});
