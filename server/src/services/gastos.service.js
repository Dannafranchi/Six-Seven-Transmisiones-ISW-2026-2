const prisma = require('../config/prisma');
const { TipoGasto } = require('@prisma/client');
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

  const tipos = Object.values(TipoGasto);

  return {
    tiposGeneral: tipos.filter((tipo) => tipo.startsWith('GENERAL_')),
    tiposTransmision: tipos.filter((tipo) => tipo.startsWith('TRANSMISION_')),
    transmisiones,
  };
}



module.exports = { listarGastos, crearGasto, obtenerOpciones };
