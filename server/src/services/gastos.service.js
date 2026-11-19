const fs = require('fs/promises');
const path = require('path');
const prisma = require('../config/prisma');
const { CARPETA_COMPROBANTES } = require('../config/comprobantes');
const { TipoGasto } = require('@prisma/client');

async function listarGastos() {
  const gastos = await prisma.gasto.findMany({
    orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
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

async function borrarComprobante(nombre) {
  try {
    await fs.unlink(path.join(CARPETA_COMPROBANTES, nombre));
  } catch (error) {
    console.error('No se pudo borrar el comprobante', nombre, error.message);
  }
}

async function eliminarGasto(id) {
  const gasto = await prisma.gasto.findUnique({ where: { id } });

  if (!gasto) {
    const error = new Error('El gasto no existe');
    error.statusCode = 404;
    throw error;
  }

  await prisma.gasto.delete({ where: { id } });

  if (gasto.comprobante) {
    await borrarComprobante(gasto.comprobante);
  }
}

module.exports = { listarGastos, crearGasto, obtenerOpciones, eliminarGasto };
