export const COLORS = {
  primary: '#FF6B9D',
  secondary: '#FF8E53',
  background: '#FFF5F8',
  card: '#FFFFFF',
  text: '#2D1B33',
  textSecondary: '#8B6B7A',
  border: 'rgba(255,107,157,0.15)',
  success: '#4CAF50',
  warning: '#FF9800',
  inputBg: '#FFF0F5',
};

export const MOOD_MAP: Record<string, { emoji: string; color: string; label: string }> = {
  happy:      { emoji: '😊', color: '#FFD700', label: 'Happy' },
  sad:        { emoji: '😢', color: '#6B9FD4', label: 'Sad' },
  angry:      { emoji: '😠', color: '#FF6B6B', label: 'Angry' },
  anxious:    { emoji: '😰', color: '#B39DDB', label: 'Anxious' },
  grateful:   { emoji: '🙏', color: '#81C784', label: 'Grateful' },
  frustrated: { emoji: '😤', color: '#FF8A65', label: 'Frustrated' },
  loved:      { emoji: '🥰', color: '#F48FB1', label: 'Loved' },
  neutral:    { emoji: '😐', color: '#90A4AE', label: 'Neutral' },
};

export const MOODS = Object.keys(MOOD_MAP) as (keyof typeof MOOD_MAP)[];

export const REFLECTION_TYPES = [
  { key: 'hard_time', label: 'Hard Time', color: '#FF6B6B' },
  { key: 'good_time', label: 'Good Time', color: '#81C784' },
  { key: 'gratitude', label: 'Gratitude', color: '#FFD700' },
  { key: 'growth',    label: 'Growth',    color: '#B39DDB' },
  { key: 'general',   label: 'General',   color: '#90A4AE' },
];

export const GOAL_CATEGORIES = [
  { key: 'travel',       label: 'Travel',       emoji: '✈️' },
  { key: 'financial',    label: 'Financial',    emoji: '💰' },
  { key: 'health',       label: 'Health',       emoji: '💪' },
  { key: 'relationship', label: 'Relationship', emoji: '💑' },
  { key: 'family',       label: 'Family',       emoji: '👨‍👩‍👧' },
  { key: 'personal',     label: 'Personal',     emoji: '🌱' },
  { key: 'other',        label: 'Other',        emoji: '⭐' },
];

export const TODO_CATEGORIES = [
  { key: 'chore',    label: 'Chore',    emoji: '🧹' },
  { key: 'date',     label: 'Date',     emoji: '💕' },
  { key: 'errand',   label: 'Errand',   emoji: '🛒' },
  { key: 'activity', label: 'Activity', emoji: '🎉' },
  { key: 'other',    label: 'Other',    emoji: '📌' },
];

export const MEMORY_PROMPTS = [
  'Our happiest moment',
  'A place we love',
  'Something silly we did',
  'A challenge we overcame',
  'Date night',
  'Everyday magic',
];

export const THEME_COLORS = [
  '#FF6B9D', '#E91E8C', '#FF4081', '#F06292',
  '#BA68C8', '#9C27B0', '#7B1FA2', '#AB47BC',
  '#5C6BC0', '#3F51B5', '#1976D2', '#42A5F5',
  '#26A69A', '#00897B', '#4CAF50', '#66BB6A',
  '#FF7043', '#FF5722', '#FF8E53', '#FFA726',
  '#EC407A', '#AD1457', '#C62828', '#EF5350',
  '#00ACC1', '#0097A7', '#26C6DA', '#80DEEA',
];

export const FONT_OPTIONS = [
  { key: 'System',         label: 'System',      fontFamily: undefined },
  { key: 'SpaceMono',      label: 'Space Mono',  fontFamily: 'SpaceMono' },
];
