import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { C } from './theme';

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function KpiCard({ label, value, valueColor }) {
  return (
    <View style={s.kpi}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={[s.kpiValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export function Chip({ text, bg, color }) {
  return (
    <View style={[s.chip, { backgroundColor: bg }]}>
      <Text style={[s.chipText, { color }]}>{text}</Text>
    </View>
  );
}

export function Btn({ label, onPress, primary, disabled, small }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        s.btn,
        small && s.btnSmall,
        primary ? s.btnPrimary : s.btnGhost,
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={[s.btnText, primary && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SectionLabel({ children }) {
  return <Text style={s.section}>{children}</Text>;
}

const s = StyleSheet.create({
  card: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 16 },
  kpi: { flex: 1, minWidth: 130, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14 },
  kpiLabel: { fontSize: 12.5, color: C.muted },
  kpiValue: { fontSize: 24, fontWeight: '700', color: C.ink, marginTop: 5, letterSpacing: -0.5 },
  chip: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  chipText: { fontSize: 12, fontWeight: '600' },
  btn: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { paddingHorizontal: 12, paddingVertical: 6 },
  btnGhost: { borderWidth: 1, borderColor: C.line, backgroundColor: C.surface },
  btnPrimary: { backgroundColor: C.accent },
  btnText: { fontSize: 13, fontWeight: '600', color: C.ink },
  section: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: C.faint, marginTop: 24, marginBottom: 10 },
});
