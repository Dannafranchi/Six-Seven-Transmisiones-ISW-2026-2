const prisma = require('../config/prisma');

async function listarPorPeriodo(desde, hasta) {
  const fechaDesde = new Date(desde);
  const fechaHasta = new Date(hasta);
  const [inhabilitaciones, reparaciones] = await Promise.all([
    prisma.inhabilitacionEquipo.findMany({
      where: { fecha: { gte: fechaDesde, lt: fechaHasta } },
      orderBy: { fecha: 'desc' },
      select: {
        id: true,
        fecha: true,
        precioCompra: true,
        costoReparaciones: true,
        montoPerdida: true,
        equipo: { select: { nombre: true, tipo: true } },
      },
    }),
    prisma.reparacionEquipo.findMany({
      where: {
        fechaInicio: { lt: fechaHasta },
        OR: [{ fechaFin: null }, { fechaFin: { gt: fechaDesde } }],
      },
      orderBy: { fechaInicio: 'desc' },
      select: {
        id: true,
        fechaInicio: true,
        fechaFin: true,
        costo: true,
        equipo: { select: { nombre: true, tipo: true } },
      },
    }),
  ]);

  return {
    inhabilitaciones: inhabilitaciones.map((evento) => ({
      ...evento,
      precioCompra: Number(evento.precioCompra),
      costoReparaciones: Number(evento.costoReparaciones),
      montoPerdida: Number(evento.montoPerdida),
    })),
    reparaciones: reparaciones.map((reparacion) => ({
      ...reparacion,
      costo: reparacion.costo === null ? null : Number(reparacion.costo),
    })),
  };
}

module.exports = { listarPorPeriodo };
