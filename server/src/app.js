const express = require('express');
const cors = require('cors');
const healthRouter = require('./routes/health');

const equiposRouter = require('./routes/equipos.routes');
const gastosRouter = require('./routes/gastos.routes');
const { CARPETA_COMPROBANTES } = require('./config/comprobantes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', healthRouter);
app.use('/api/equipos', equiposRouter);
app.use('/api/gastos', gastosRouter);
app.use('/api/comprobantes', express.static(CARPETA_COMPROBANTES));

module.exports = app;
