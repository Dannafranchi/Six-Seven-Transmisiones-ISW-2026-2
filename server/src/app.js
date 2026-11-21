const express = require('express');
const cors = require('cors');
const healthRouter = require('./routes/health');

const gastosRouter = require('./routes/gastos.routes');
const resumenRouter = require('./routes/resumen.routes');
const { CARPETA_COMPROBANTES } = require('./config/comprobantes');

const equiposRouter = require('./routes/equipos.routes');
const kitsRouter = require('./routes/kits.routes');
const mermasRouter = require('./routes/mermas.routes');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', healthRouter);

app.use('/api/gastos', gastosRouter);
app.use('/api/resumen', resumenRouter);
app.use('/api/comprobantes', express.static(CARPETA_COMPROBANTES));

app.use('/api/equipos', equiposRouter);
app.use('/api/kits', kitsRouter);
app.use('/api/mermas', mermasRouter);

module.exports = app;
