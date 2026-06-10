import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView, View, Text, TouchableOpacity,
  StyleSheet, StatusBar, Platform, ActivityIndicator,
} from 'react-native';
import { C } from './theme';
import { SheetProvider } from './state/SheetContext';
import OwnerScreen from './screens/OwnerScreen';
import DistributorScreen from './screens/DistributorScreen';
import ReconcileScreen from './screens/ReconcileScreen';

const ROLE_KEY = 'organicles_role';

const ALL_TABS = [
  { key: 'owner', label: 'Owner',       screen: OwnerScreen      },
  { key: 'dist',  label: 'Distributor', screen: DistributorScreen },
  { key: 'recon', label: 'Reconcile',   screen: ReconcileScreen   },
];

export default function App() {
  const [role,        setRole]        = useState(null);
  const [tab,         setTab]         = useState('owner');
  const [roleLoading, setRoleLoading] = useState(true);

  // On startup, check if a role was previously saved.
  useEffect(() => {
    AsyncStorage.getItem(ROLE_KEY)
      .then((saved) => {
        if (saved) {
          setRole(saved);
          setTab(saved === 'owner' ? 'owner' : 'dist');
        }
      })
      .finally(() => setRoleLoading(false));
  }, []);

  async function handleSelectRole(r) {
    await AsyncStorage.setItem(ROLE_KEY, r);
    setRole(r);
    setTab(r === 'owner' ? 'owner' : 'dist');
  }

  async function handleSwitchRole() {
    await AsyncStorage.removeItem(ROLE_KEY);
    setRole(null);
  }

  // Still reading AsyncStorage — show a blank loader.
  if (roleLoading) {
    return (
      <SafeAreaView style={[st.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.accent} />
      </SafeAreaView>
    );
  }

  const tabs      = role === 'owner' ? ALL_TABS : ALL_TABS.filter((t) => t.key === 'dist');
  const activeTab = tabs.find((t) => t.key === tab) || tabs[0];
  const Active    = activeTab.screen;

  return (
    <SheetProvider>
      {!role ? (
        <RolePicker onSelect={handleSelectRole} />
      ) : (
        <SafeAreaView style={st.safe}>
          <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
          <View style={st.appbar}>
            <View style={st.brandRow}>
              <Text style={st.brand}>Organicles</Text>
              <Text style={st.brandSub}>Distribution Tracking</Text>
            </View>
            <TouchableOpacity style={st.badge} onPress={handleSwitchRole}>
              <Text style={st.badgeText}>{role === 'owner' ? 'OWNER' : 'DISTRIBUTOR'}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Active />
          </View>

          {tabs.length > 1 && (
            <View style={st.tabbar}>
              {tabs.map((t) => {
                const active = t.key === activeTab.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[st.tab, active && st.tabActive]}
                    activeOpacity={0.8}
                    onPress={() => setTab(t.key)}
                  >
                    <Text style={[st.tabText, active && st.tabTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </SafeAreaView>
      )}
    </SheetProvider>
  );
}

// RolePicker and styles stay exactly the same as before

function RolePicker({ onSelect }) {
  return (
    <SafeAreaView style={[st.safe, st.picker]}>
      <Text style={st.brand}>Organicles</Text>
      <Text style={[st.brandSub, { marginBottom: 32 }]}>Who are you?</Text>
      <TouchableOpacity style={st.roleBtn} onPress={() => onSelect('owner')}>
        <Text style={st.roleBtnText}>Owner</Text>
        <Text style={st.roleDesc}>Prepare sheets · Reconcile cash</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[st.roleBtn, st.roleBtnAccent]} onPress={() => onSelect('distributor')}>
        <Text style={[st.roleBtnText, { color: '#fff' }]}>Distributor</Text>
        <Text style={[st.roleDesc, { color: C.accentSoft }]}>Work today's delivery sheet</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  appbar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  brandRow:{ flexDirection: 'row', alignItems: 'baseline', gap: 9 },
  brand:   { fontSize: 21, fontWeight: '700', color: C.ink },
  brandSub:{ fontSize: 12.5, color: C.muted, fontWeight: '500' },
  badge:   { backgroundColor: C.accentSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  badgeText:{ fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: C.accentInk },
  tabbar:  { flexDirection: 'row', gap: 4, padding: 8, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.surface },
  tab:     { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  tabActive:{ backgroundColor: C.accent },
  tabText: { fontSize: 13.5, fontWeight: '600', color: C.muted },
  tabTextActive: { color: '#fff' },
  picker:  { justifyContent: 'center', alignItems: 'center', gap: 12 },
  roleBtn: { width: '80%', padding: 20, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center' },
  roleBtnAccent: { backgroundColor: C.accent, borderColor: C.accent },
  roleBtnText: { fontSize: 18, fontWeight: '700', color: C.ink },
  roleDesc:{ fontSize: 13, color: C.muted, marginTop: 4 },
});
