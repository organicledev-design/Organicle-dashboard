const express  = require('express');
const router   = express.Router();
const supabase = require('../lib/supabase');

// GET /sheets/active — open sheet with its stops for the Distributor screen
router.get('/active', async (req, res) => {
  try {
    const { data: sheets, error: sheetErr } = await supabase
      .from('load_sheets')
      .select('*, distributors(name), territories(name)')
      .eq('status', 'open')
      .order('id', { ascending: false })
      .limit(1);

    const sheet = sheets?.[0] ?? null;

    // No open sheet — not an error, just nothing to show yet.
    if (sheetErr) throw sheetErr;
    if (!sheet) return res.json(null);

    const { data: stops, error: stopsErr } = await supabase
      .from('stops')
      .select('*')
      .eq('sheet_id', sheet.id);

    if (stopsErr) throw stopsErr;

    res.json({
      id:          sheet.id,
      distributor: sheet.distributors.name,
      territory:   sheet.territories.name,
      status:      sheet.status,
      stops: stops.map((s) => ({
        id:        s.id,
        name:      s.mart_name,
        items:     s.items,
        amount:    s.amount,
        status:    s.status,
        collected: s.collected,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// POST /sheets — build a new load sheet with stops
router.post('/', async (req, res) => {
  try {
    const { distributor_id, territory_id, stops } = req.body;

    // find last sheet and increment the number
    const { data: last } = await supabase
      .from('load_sheets')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase.from('load_sheets').update({ status: 'closed' }).eq('status', 'open');

    const nextNum = last ? parseInt(last.id.split('-')[1]) + 1 : 1;
    const newId   = 'LS-' + String(nextNum).padStart(4, '0');

    // create the sheet row
    const { error: sheetErr } = await supabase
      .from('load_sheets')
      .insert({
        id:            newId,
        distributor_id,
        territory_id,
        delivery_date: new Date().toISOString().split('T')[0],
        status:        'open',
      });

    if (sheetErr) throw sheetErr;

    // create one stop row per mart
    const stopRows = stops.map((s) => ({
      sheet_id:  newId,
      mart_name: s.mart_name,
      items:     s.items,
      amount:    s.amount,
      status:    'pending',
      collected: 0,
    }));

    const { error: stopsErr } = await supabase.from('stops').insert(stopRows);
    if (stopsErr) throw stopsErr;

    const { data: created } = await supabase
      .from('load_sheets')
      .select('*, distributors(name), territories(name)')
      .eq('id', newId)
      .single();

    res.status(201).json({
      id:          newId,
      distributor: created.distributors.name,
      territory:   created.territories.name,
      status:      'open',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// POST /sheets/:id/close — close the sheet and write reconciliation to DB
router.post('/:id/close', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: stops, error: stopsErr } = await supabase
      .from('stops')
      .select('*')
      .eq('sheet_id', id);

    if (stopsErr) throw stopsErr;

    const delivered = stops.filter((s) => s.status === 'delivered');
    const returned  = stops.filter((s) => s.status === 'returned');
    const expected  = delivered.reduce((a, s) => a + s.amount, 0);
    const collected = delivered.reduce((a, s) => a + s.collected, 0);

    const { data: recon, error: reconErr } = await supabase
      .from('reconciliations')
      .insert({
        sheet_id:  id,
        expected,
        collected,
        delivered: delivered.length,
        returned:  returned.length,
      })
      .select()
      .single();

    if (reconErr) throw reconErr;

    const { error: updateErr } = await supabase
      .from('load_sheets')
      .update({ status: 'closed' })
      .eq('id', id);

    if (updateErr) throw updateErr;

    res.json(recon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/:id/reset', async (req, res) => {
  try {
    const { id } = req.params;

    await supabase.from('reconciliations').delete().eq('sheet_id', id);
    await supabase.from('stops').update({ status: 'pending', collected: 0 }).eq('sheet_id', id);
    await supabase.from('load_sheets').update({ status: 'open' }).eq('id', id);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
