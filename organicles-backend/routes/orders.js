const express  = require('express');
const router   = express.Router();
const supabase = require('../lib/supabase');

// GET /orders/confirmed — summary for the Owner screen KPIs
router.get('/confirmed', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'confirmed');

    if (error) throw error;

    res.json({
      count:     data.length,
      shopify:   data.filter((o) => o.channel === 'shopify').length,
      ginkgo:    data.filter((o) => o.channel === 'ginkgo').length,
      territory: 'Lahore Central',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
