import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput } from 'react-native';
import { C, peso } from '../theme';
import { Card, KpiCard, Chip, Btn, SectionLabel } from '../components';
import { getConfirmedSummary } from '../services/orders';
import { useSheet } from '../state/SheetContext';

export default function OwnerScreen() {
  const { stops, sheetStatus, reconciliations, loading, selectRecon, createSheet } = useSheet();
  const [confirmed,  setConfirmed]  = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [newStops,   setNewStops]   = useState([]);
  const [form, setForm] = useState({ mart_name: '', items: '', amount: '' });

  useEffect(() => {
    getConfirmedSummary().then(setConfirmed).catch(console.error);
  }, []);

  const delivered   = stops.filter((s) => s.status === 'delivered').length;
  const outOnSheets = sheetStatus === 'open' ? stops.length : 0;
  const cashToRecon = reconciliations.reduce((a, r) => a + r.expected, 0);

  function addStop() {
    if (!form.mart_name || !form.items || !form.amount) return;
    setNewStops((prev) => [...prev, {
      mart_name: form.mart_name,
      items:     parseInt(form.items),
      amount:    parseInt(form.amount),
    }]);
    setForm({ mart_name: '', items: '', amount: '' });
  }

  async function handleCreate() {
    if (newStops.length === 0) return;
    await createSheet('DIST-001', 'TER-001', newStops);
    setNewStops([]);
    setShowModal(false);
  }

  if (loading) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={st.pad}>
        <View style={st.head}>
          <Text style={st.title}>Owner</Text>
          <Text style={st.sub}>all territories · today</Text>
        </View>

        <View style={st.kpiRow}>
          <KpiCard label="Confirmed, waiting" value={confirmed ? String(confirmed.count) : '—'} />
          <KpiCard label="Out on sheets"      value={String(outOnSheets)} />
        </View>
        <View style={st.kpiRow}>
          <KpiCard label="Delivered today"   value={String(delivered)} />
          <KpiCard label="Cash to reconcile" value={peso(cashToRecon)} valueColor={cashToRecon > 0 ? C.warn : C.ink} />
        </View>

        <SectionLabel>Prepare a load sheet</SectionLabel>
        <Card>
          <Text style={st.cardTitle}>{confirmed ? confirmed.count : '—'} confirmed orders ready</Text>
          {confirmed && (
            <View style={st.chipRow}>
              <Chip text={'Shopify ' + confirmed.shopify} bg={C.shopifySoft} color={C.shopify} />
              <Chip text={'Ginkgo '  + confirmed.ginkgo}  bg={C.ginkgoSoft}  color={C.ginkgo}  />
              <Text style={st.faint}>{'· ' + confirmed.territory}</Text>
            </View>
          )}
          <View style={{ marginTop: 14, alignSelf: 'flex-start' }}>
            <Btn label="Build sheet →" primary onPress={() => setShowModal(true)} />
          </View>
        </Card>

        <SectionLabel>Sheets to reconcile</SectionLabel>
        <Card style={{ padding: 0 }}>
          {reconciliations.length === 0 ? (
            <Text style={[st.faint, { padding: 16 }]}>No sheets returned yet.</Text>
          ) : (
            reconciliations.map((sh, i) => {
              const ok = sh.collected >= sh.expected;
              const statusChip =
                sh.status === 'accepted' ? { text: 'Accepted ✓', bg: C.accentSoft,  color: C.accentInk } :
                sh.status === 'on_hold'  ? { text: 'On hold',    bg: C.warnSoft,    color: C.warn      } :
                                           { text: 'Pending',    bg: C.neutralSoft, color: C.muted     };
              return (
                <TouchableOpacity
                  key={sh.id}
                  style={[st.row, i < reconciliations.length - 1 && st.rowBorder]}
                  onPress={() => selectRecon(sh.id)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={st.rowName}>{'#' + sh.id + ' · ' + sh.distributor}</Text>
                    <Text style={st.rowMeta}>{sh.delivered + ' delivered · ' + sh.returned + ' returned'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 5 }}>
                    <Chip text={statusChip.text} bg={statusChip.bg} color={statusChip.color} />
                    <Chip
                      text={Math.round(sh.collected / 1000) + 'k / ' + Math.round(sh.expected / 1000) + 'k'}
                      bg={ok ? C.accentSoft : C.dangerSoft}
                      color={ok ? C.accentInk : C.danger}
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </Card>
      </ScrollView>

      <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={st.modalWrap}>
          <View style={st.modalHead}>
            <Text style={st.modalTitle}>Build Sheet</Text>
            <Btn label="Cancel" onPress={() => setShowModal(false)} />
          </View>

          <View style={st.inputGroup}>
            <TextInput
              style={st.input}
              placeholder="Mart name"
              value={form.mart_name}
              onChangeText={(v) => setForm((p) => ({ ...p, mart_name: v }))}
            />
            <View style={st.inputRow}>
              <TextInput
                style={[st.input, { flex: 1 }]}
                placeholder="Items"
                keyboardType="numeric"
                value={form.items}
                onChangeText={(v) => setForm((p) => ({ ...p, items: v }))}
              />
              <TextInput
                style={[st.input, { flex: 1 }]}
                placeholder="Amount ₨"
                keyboardType="numeric"
                value={form.amount}
                onChangeText={(v) => setForm((p) => ({ ...p, amount: v }))}
              />
            </View>
            <Btn label="Add stop" onPress={addStop} />
          </View>

          <ScrollView style={{ flex: 1 }}>
            {newStops.map((s, i) => (
              <View key={i} style={st.stopRow}>
                <Text style={st.stopName}>{s.mart_name}</Text>
                <Text style={st.stopMeta}>{s.items + ' items · ' + peso(s.amount)}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={st.modalFoot}>
            <Btn
              label={'Create Sheet (' + newStops.length + ' stops)'}
              primary
              disabled={newStops.length === 0}
              onPress={handleCreate}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const st = StyleSheet.create({
  pad:        { padding: 18, paddingBottom: 40 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  head:       { marginBottom: 16 },
  title:      { fontSize: 20, fontWeight: '700', color: C.ink },
  sub:        { fontSize: 13, color: C.muted, marginTop: 2 },
  kpiRow:     { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardTitle:  { fontSize: 15, fontWeight: '600', color: C.ink },
  chipRow:    { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9, flexWrap: 'wrap' },
  faint:      { color: C.muted, fontSize: 13 },
  row:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowBorder:  { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  rowName:    { fontWeight: '600', fontSize: 14.5, color: C.ink },
  rowMeta:    { fontSize: 12.5, color: C.muted, marginTop: 2 },
  modalWrap:  { flex: 1, padding: 18, backgroundColor: '#F7F7F5' },
  modalHead:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.ink },
  inputGroup: { gap: 10, marginBottom: 20 },
  inputRow:   { flexDirection: 'row', gap: 10 },
  input:      { borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 12, fontSize: 14, color: C.ink, backgroundColor: C.surface },
  stopRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  stopName:   { fontWeight: '600', fontSize: 14, color: C.ink },
  stopMeta:   { fontSize: 13, color: C.muted },
  modalFoot:  { paddingTop: 16 },
});
