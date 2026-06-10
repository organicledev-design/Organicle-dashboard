const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const sheetsRouter          = require('./routes/sheets');
const stopsRouter           = require('./routes/stops');
const ordersRouter          = require('./routes/orders');
const reconciliationsRouter = require('./routes/reconciliations');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/sheets',          sheetsRouter);
app.use('/stops',           stopsRouter);
app.use('/orders',          ordersRouter);
app.use('/reconciliations', reconciliationsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Organicles backend running on port ${PORT}`));
