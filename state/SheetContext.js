import { createContext, useContext, useState, useEffect } from 'react';
import {
  getTodaySheet,
  getReconList,
  getReconDetail,
  apiMarkStop,
  apiCloseSheet,
  updateReconStatus,
    buildSheet,

} from '../services/orders';

const SheetContext = createContext(null);

export function SheetProvider({ children }) {
  const [sheet,           setSheet]           = useState(null);
  const [stops,           setStops]           = useState([]);
  const [sheetStatus,     setSheetStatus]     = useState('open');
  const [reconciliations, setReconciliations] = useState([]);
  const [selectedRecon,   setSelectedRecon]   = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [sheetData, reconData] = await Promise.all([
          getTodaySheet(),
          getReconList(),
        ]);

        if (sheetData) {
          setSheet({ id: sheetData.id, distributor: sheetData.distributor, territory: sheetData.territory });
          setStops(sheetData.stops);
          setSheetStatus(sheetData.status);
        }

        setReconciliations(reconData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function selectRecon(sheetId) {
    try {
      const detail = await getReconDetail(sheetId);
      setSelectedRecon(detail);
    } catch (err) {
      console.error('Failed to load recon detail:', err);
    }
  }

  async function markStop(index, status) {
    const stop = stops[index];
    try {
      const updated = await apiMarkStop(stop.id, status);
      setStops((prev) => prev.map((s, i) => (i === index ? { ...s, ...updated } : s)));
    } catch (err) {
      console.error('Failed to mark stop:', err);
    }
  }

  async function closeSheet() {
    if (sheetStatus === 'closed') return;
    try {
      await apiCloseSheet(sheet.id);
      setSheetStatus('closed');
      const reconData = await getReconList();
      setReconciliations(reconData);
      if (reconData.length > 0) selectRecon(reconData[0].id);
    } catch (err) {
      console.error('Failed to close sheet:', err);
    }
  }
  async function createSheet(distributor_id, territory_id, stops) {
  try {
    await buildSheet(distributor_id, territory_id, stops);
    const sheetData = await getTodaySheet();
    setSheet({ id: sheetData.id, distributor: sheetData.distributor, territory: sheetData.territory });
    setStops(sheetData.stops);
    setSheetStatus(sheetData.status);
  } catch (err) {
    console.error('Failed to create sheet:', err);
  }
}


  async function acceptRecon() {
    if (!selectedRecon) return;
    try {
      await updateReconStatus(selectedRecon.id, 'accepted');
      setSelectedRecon((prev) => ({ ...prev, status: 'accepted' }));
      setReconciliations((prev) =>
        prev.map((r) => r.id === selectedRecon.id ? { ...r, status: 'accepted' } : r)
      );
    } catch (err) {
      console.error('Failed to accept recon:', err);
    }
  }

  async function holdRecon() {
    if (!selectedRecon) return;
    try {
      await updateReconStatus(selectedRecon.id, 'on_hold');
      setSelectedRecon((prev) => ({ ...prev, status: 'on_hold' }));
      setReconciliations((prev) =>
        prev.map((r) => r.id === selectedRecon.id ? { ...r, status: 'on_hold' } : r)
      );
    } catch (err) {
      console.error('Failed to hold recon:', err);
    }
  }

  return (
    <SheetContext.Provider
      value={{
  sheet, stops, sheetStatus, loading, error,
  markStop, closeSheet, createSheet,
  reconciliations, selectedRecon, selectRecon,
  acceptRecon, holdRecon,
}}

    >
      {children}
    </SheetContext.Provider>
  );
}

export const useSheet = () => useContext(SheetContext);
