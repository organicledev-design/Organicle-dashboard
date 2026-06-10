const express  = require('express');
const router   = express.Router();
const supabase = require('../lib/supabase');

// GET /reconciliations — list for the Owner reconcile list
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reconciliations')
      .select('*, load_sheets(id, distributor_id, distributors(name))')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const shaped = data.map((r) => ({
      id:          r.load_sheets.id,
      distributor: r.load_sheets.distributors.name,
      delivered:   r.delivered,
      returned:    r.returned,
      expected:    r.expected,
      collected:   r.collected,
      variance:    r.variance,
      status:      r.status,
    }));

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /reconciliations/:sheetId — full detail for the Reconcile screen
router.get('/:sheetId', async (req, res) => {
  try {
    const { sheetId } = req.params;

    const [{ data: recon, error: reconErr }, { data: stops, error: stopsErr }] =
      await Promise.all([
        supabase
          .from('reconciliations')
          .select('*, load_sheets(id, distributors(name))')
          .eq('sheet_id', sheetId)
          .single(),
        supabase
          .from('stops')
          .select('*')
          .eq('sheet_id', sheetId),
      ]);

    if (reconErr) throw reconErr;
    if (stopsErr) throw stopsErr;

    const delivered  = stops.filter((s) => s.status === 'delivered');
    const returned   = stops.filter((s) => s.status === 'returned');
    const shortPaid  = delivered.filter((s) => s.collected < s.amount);
    const cleanStops = delivered.filter((s) => s.collected >= s.amount);

    const exceptions = [
      ...shortPaid.map((s) => ({
        name: s.mart_name,
        meta: `delivered · expected ₨${s.amount.toLocaleString()} · got ₨${s.collected.toLocaleString()}`,
        tag:  `short ₨${(s.amount - s.collected).toLocaleString()}`,
        kind: 'bad',
      })),
      ...returned.map((s) => ({
        name: s.mart_name,
        meta: 'returned · goods back · rolls to next sheet',
        tag:  'returned',
        kind: 'muted',
      })),
    ];

    res.json({
      id:          recon.load_sheets.id,
      distributor: recon.load_sheets.distributors.name,
      stops:       stops.length,
      delivered:   recon.delivered,
      returned:    recon.returned,
      expected:    recon.expected,
      collected:   recon.collected,
      variance:    recon.variance,
      status:      recon.status,
      cleanCount:  cleanStops.length,
      cleanCash:   cleanStops.reduce((a, s) => a + s.amount, 0),
      exceptions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /reconciliations/:sheetId/status — accept or hold a reconciliation
router.patch('/:sheetId/status', async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { status }  = req.body;

    const { data, error } = await supabase
      .from('reconciliations')
      .update({ status })
      .eq('sheet_id', sheetId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
