const prisma = require('../config/prisma');

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

module.exports = { listarGastos };
