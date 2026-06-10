import { api } from './api';

export async function getConfirmedSummary() {
  return api.get('/orders/confirmed');
}

export async function getReconList() {
  return api.get('/reconciliations');
}

export async function getTodaySheet() {
  return api.get('/sheets/active');
}

export async function getReconDetail(sheetId) {
  return api.get(`/reconciliations/${sheetId}`);
}

export async function apiMarkStop(stopId, status) {
  return api.patch(`/stops/${stopId}`, { status });
}

export async function apiCloseSheet(sheetId) {
  return api.post(`/sheets/${sheetId}/close`);
}

export async function updateReconStatus(sheetId, status) {
  return api.patch(`/reconciliations/${sheetId}/status`, { status });
}
export async function buildSheet(distributor_id, territory_id, stops) {
  return api.post('/sheets', { distributor_id, territory_id, stops });
}

