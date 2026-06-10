import { ActivityIndicator, ScrollView, View, Text, StyleSheet } from 'react-native';
import { C, peso } from '../theme';
import { KpiCard, Btn, SectionLabel } from '../components';
import { useSheet } from '../state/SheetContext';

export default function DistributorScreen() {
  const { sheet, stops, sheetStatus, loading, markStop, closeSheet } = useSheet();

  const delivered = stops.filter((s) => s.status === 'delivered');
  const returned  = stops.filter((s) => s.status === 'returned');
  const cash      = delivered.reduce((a, s) => a + s.collected, 0);
  const isClosed  = sheetStatus === 'closed';

  if (loading) {
  return (
    <View style={st.center}>
      <ActivityIndicator size="large" color={C.accent} />
    </View>
  );
}

if (!sheet) {
  return (
    <View style={st.center}>
      <Text style={st.noSheetText}>No active sheet.</Text>
      <Text style={st.noSheetSub}>The owner hasn't built one yet.</Text>
    </View>
  );
}


  return (
    <ScrollView contentContainerStyle={st.pad}>
      <View style={st.head}>
        <Text style={st.title}>{sheet.distributor}</Text>
        <Text style={st.sub}>{sheet.territory + ' · Sheet #' + sheet.id}</Text>
      </View>

      <View style={st.kpiRow}>
        <KpiCard label="Stops"     value={String(stops.length)} />
        <KpiCard label="Delivered" value={String(delivered.length)} />
      </View>
      <View style={st.kpiRow}>
        <KpiCard label="Returned"       value={String(returned.length)} />
        <KpiCard label="Cash collected" value={peso(cash)} valueColor={C.accentInk} />
      </View>

      <SectionLabel>Today's sheet — mark each mart</SectionLabel>
      <View style={st.list}>
        {stops.map((stop, i) => {
          const ss   = statusStyle(stop.status);
          const done = stop.status !== 'pending';
          return (
            <View key={stop.name} style={[st.item, i < stops.length - 1 && st.itemBorder]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={st.name}>{stop.name}</Text>
                <Text style={[st.meta, { color: ss.color }]}>
                  {ss.label + ' · ' + stop.items + ' items · ' + peso(stop.amount)}
                </Text>
              </View>
              {!done && !isClosed ? (
                <View style={st.btns}>
                  <Btn label="Delivered" small onPress={() => markStop(i, 'delivered')} />
                  <Btn label="Return"    small onPress={() => markStop(i, 'returned')}  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={st.foot}>
        <Text style={st.footNote}>
          {isClosed
            ? 'Sheet closed — handed back to owner.'
            : 'Returns stay on the sheet → roll to next sheet.'}
        </Text>
        <Btn
          label={isClosed ? 'Sheet closed ✓' : 'Close sheet →'}
          primary
          disabled={isClosed}
          onPress={closeSheet}
        />
      </View>
    </ScrollView>
  );
}

function statusStyle(status) {
  if (status === 'delivered') return { label: 'Delivered', color: C.accentInk };
  if (status === 'returned')  return { label: 'Returned',  color: C.warn      };
  return                             { label: 'Pending',   color: C.muted     };
}

const st = StyleSheet.create({
  pad:       { padding: 18, paddingBottom: 40 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  head:      { marginBottom: 16 },
  title:     { fontSize: 20, fontWeight: '700', color: C.ink },
  sub:       { fontSize: 13, color: C.muted, marginTop: 2 },
  kpiRow:    { flexDirection: 'row', gap: 12, marginBottom: 12 },
  list:      { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 14, overflow: 'hidden' },
  item:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  itemBorder:{ borderBottomWidth: 1, borderBottomColor: C.lineSoft },
  name:      { fontWeight: '600', fontSize: 14.5, color: C.ink },
  meta:      { fontSize: 12.5, marginTop: 2 },
  btns:      { flexDirection: 'row', gap: 7 },
  foot:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 10, flexWrap: 'wrap' },
  noSheetText: { fontSize: 17, fontWeight: '600', color: C.ink },
noSheetSub:  { fontSize: 13, color: C.muted, marginTop: 6 },

  footNote:  { fontSize: 12, color: C.faint, flex: 1 },
});
