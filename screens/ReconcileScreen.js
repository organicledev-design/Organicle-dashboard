import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, peso } from '../theme';
import { KpiCard, Chip, Btn, SectionLabel } from '../components';
import { useSheet } from '../state/SheetContext';

export default function ReconcileScreen() {
  const { selectedRecon: d, acceptRecon, holdRecon } = useSheet();

  if (!d) {
    return (
      <View style={st.empty}>
        <Text style={st.emptyText}>No sheet closed yet.</Text>
        <Text style={st.emptySub}>Close a sheet from the Distributor tab to see reconciliation.</Text>
      </View>
    );
  }

  const variance   = d.collected - d.expected;
  const isResolved = d.status === 'accepted' || d.status === 'on_hold';

  return (
    <ScrollView contentContainerStyle={st.pad}>
      <View style={st.head}>
        <Text style={st.title}>{'Reconcile · #' + d.id}</Text>
        <View style={st.headRow}>
          <Text style={st.sub}>{d.distributor + ' · closed today'}</Text>
          {isResolved && (
            <Chip
              text={d.status === 'accepted' ? 'Accepted ✓' : 'On hold'}
              bg={d.status === 'accepted' ? C.accentSoft : C.warnSoft}
              color={d.status === 'accepted' ? C.accentInk : C.warn}
            />
          )}
        </View>
      </View>

      <View style={st.kpiRow}>
        <KpiCard label="Stops"     value={String(d.stops)} />
        <KpiCard label="Delivered" value={String(d.delivered)} valueColor={C.accentInk} />
        <KpiCard label="Returned"  value={String(d.returned)}  valueColor={C.muted}     />
      </View>

      <SectionLabel>Cash</SectionLabel>
      <View style={st.cashBox}>
        <CashRow label={'Expected (' + d.delivered + ' delivered)'} value={peso(d.expected)}  />
        <CashRow label="Collected & handed in"                      value={peso(d.collected)} />
        <View style={st.cashTotalRow}>
          <Text style={st.cashTotalLabel}>Variance</Text>
          <Text style={[st.variance, { color: variance === 0 ? C.accentInk : C.danger }]}>
            {variance === 0
              ? '₨0 — matched ✓'
              : (variance < 0 ? '− ' : '') + peso(Math.abs(variance))}
          </Text>
        </View>
      </View>

      <SectionLabel>Needs your attention</SectionLabel>
      {d.exceptions.length === 0 ? (
        <Text style={st.faint}>No exceptions — all stops delivered and paid in full.</Text>
      ) : (
        <View style={st.list}>
          {d.exceptions.map((e, i) => (
            <View key={e.name} style={[st.item, i < d.exceptions.length - 1 && st.itemBorder]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={st.name}>{e.name}</Text>
                <Text style={st.meta}>{e.meta}</Text>
              </View>
              <Chip
                text={e.tag}
                bg={e.kind === 'bad' ? C.dangerSoft : C.neutralSoft}
                color={e.kind === 'bad' ? C.danger : C.muted}
              />
            </View>
          ))}
        </View>
      )}

      <Text style={st.faint}>
        {'+ ' + d.cleanCount + ' stops delivered and paid in full · ' + peso(d.cleanCash) + ' ✓'}
      </Text>

      {!isResolved && (
        <View style={st.actions}>
        


{variance < 0 && (
  <Btn label={'Hold — investigate ' + peso(Math.abs(variance))} onPress={holdRecon} />
)}
<Btn label="Accept & close" primary onPress={acceptRecon} />

        </View>
      )}
    </ScrollView>
  );
}

function CashRow({ label, value }) {
  return (
    <View style={st.cashRow}>
      <Text style={st.cashLabel}>{label}</Text>
      <Text style={st.cashValue}>{value}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  pad:           { padding: 18, paddingBottom: 40 },
  empty:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText:     { fontSize: 17, fontWeight: '600', color: C.ink },
  emptySub:      { fontSize: 13, color: C.muted, marginTop: 8, textAlign: 'center' },
  head:          { marginBottom: 16 },
  headRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  title:         { fontSize: 20, fontWeight: '700', color: C.ink },
  sub:           { fontSize: 13, color: C.muted },
  kpiRow:        { flexDirection: 'row', gap: 12 },
  cashBox:       { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 16 },
  cashRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  cashLabel:     { fontSize: 14, color: C.muted },
  cashValue:     { fontSize: 14, fontWeight: '600', color: C.ink },
  cashTotalRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 11, marginTop: 7, borderTopWidth: 1, borderTopColor: C.line },
  cashTotalLabel:{ fontSize: 16, fontWeight: '700', color: C.ink },
  variance:      { fontSize: 16, fontWeight: '700' },
  list:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 14, overflow: 'hidden' },
  item:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  itemBorder:    { borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  name:          { fontWeight: '600', fontSize: 14.5, color: C.ink },
  meta:          { fontSize: 12.5, color: C.muted, marginTop: 2 },
  faint:         { fontSize: 13, color: C.faint, marginTop: 11 },
  actions:       { flexDirection: 'row', gap: 9, marginTop: 18, flexWrap: 'wrap' },
});
