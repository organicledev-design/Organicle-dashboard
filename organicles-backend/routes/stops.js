const express  = require('express');
const router   = express.Router();
const supabase = require('../lib/supabase');

// PATCH /stops/:id — mark a stop delivered or returned
router.patch('/:id', async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    // On delivery, collected = full amount. On return, collected = 0.
    let collected = 0;
    if (status === 'delivered') {
      const { data, error } = await supabase
        .from('stops')
        .select('amount')
        .eq('id', id)
        .single();
      if (error) throw error;
      collected = data.amount;
    }

    const { data, error } = await supabase
      .from('stops')
      .update({ status, collected })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
