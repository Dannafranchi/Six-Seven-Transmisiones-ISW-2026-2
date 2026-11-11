const prisma = require('../config/prisma');
const { TIPOS_GASTO_GENERAL } = require('../constants/tiposGasto');
const {TIPOS_GASTO_TRANSMISION} = require('../constants/tiposGasto');
const LIMITE_HISTORIAL = 20;

async function listarGastos() {
  const gastos = await prisma.gasto.findMany({
    orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
    take: LIMITE_HISTORIAL,
    include: {
      transmision: { select: { id: true, nombre: true, fecha: true } },
    },
  });

  return gastos.map((gasto) => ({
    ...gasto,
    valor: Number(gasto.valor),
  }));
}

async function crearGasto(gastoData) {
  const nuevoGasto = await prisma.gasto.create({
    data: gastoData,
  });

   return {
    ...nuevoGasto,
    valor: Number(nuevoGasto.valor),
  };
}

async function obtenerOpciones() {
  const transmisiones = await prisma.transmision.findMany({
    orderBy: { fecha: 'desc' },
    select: { id: true, nombre: true, fecha: true },
  });

  return {
    tiposGeneral: TIPOS_GASTO_GENERAL,
    tiposTransmision: TIPOS_GASTO_TRANSMISION,
    transmisiones,
  };
}



module.exports = { listarGastos, crearGasto, obtenerOpciones };
