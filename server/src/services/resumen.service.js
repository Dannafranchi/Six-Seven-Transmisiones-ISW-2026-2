const prisma = require('../config/prisma');

function rangoDelMes(mes) {
  const [anio, numeroMes] = mes.split('-').map(Number);
  return {
    gte: new Date(Date.UTC(anio, numeroMes - 1, 1)),
    lt: new Date(Date.UTC(anio, numeroMes, 1)),
  };
}

function sumar(lista, campo) {
  return lista.reduce((total, item) => total + Number(item[campo]), 0);
}

function calcularTransmision(transmision) {
  const monetarios = transmision.auspicios.filter((auspicio) => auspicio.tipo === 'MONETARIO');
  const cobro = Number(transmision.valor);
  const auspicios = sumar(monetarios, 'valor');
  const ingresos = cobro + auspicios;
  const gastos = sumar(transmision.gastos, 'valor');
  const remuneraciones = sumar(transmision.asignaciones, 'pago');

  return {
    id: transmision.id,
    nombre: transmision.nombre,
    fecha: transmision.fecha,
    cobro,
    auspicios,
    ingresos,
    gastos,
    remuneraciones,
    ganancia: ingresos - gastos - remuneraciones,
  };
}

async function obtenerResumen(mes) {
  const fecha = rangoDelMes(mes);

  const [transmisionesDelMes, gastosGeneralesPorTipo] = await Promise.all([
    prisma.transmision.findMany({
      where: { fecha },
      orderBy: { fecha: 'asc' },
      include: {
        auspicios: { select: { tipo: true, valor: true } },
        gastos: { select: { valor: true } },
        asignaciones: { select: { pago: true } },
      },
    }),
    prisma.gasto.groupBy({
      by: ['tipo'],
      where: { transmisionId: null, fecha },
      _sum: { valor: true },
      orderBy: { tipo: 'asc' },
    }),
  ]);

  const transmisiones = transmisionesDelMes.map(calcularTransmision);

  const canjes = transmisionesDelMes
    .flatMap((transmision) => transmision.auspicios)
    .filter((auspicio) => auspicio.tipo === 'CANJE');

  const gastosGenerales = gastosGeneralesPorTipo.map((grupo) => ({
    tipo: grupo.tipo,
    total: Number(grupo._sum.valor),
  }));

  const ingresos = {
    cobros: sumar(transmisiones, 'cobro'),
    auspicios: sumar(transmisiones, 'auspicios'),
    total: sumar(transmisiones, 'ingresos'),
  };

  const costos = {
    gastosTransmision: sumar(transmisiones, 'gastos'),
    remuneraciones: sumar(transmisiones, 'remuneraciones'),
  };
  costos.total = costos.gastosTransmision + costos.remuneraciones;

  const resultadoTransmisiones = ingresos.total - costos.total;
  const totalGastosGenerales = sumar(gastosGenerales, 'total');
  const utilidad = resultadoTransmisiones - totalGastosGenerales;
  const margen = ingresos.total ? Math.round((utilidad / ingresos.total) * 1000) / 10 : null;

  return {
    mes,
    ingresos,
    costos,
    resultadoTransmisiones,
    gastosGenerales: { detalle: gastosGenerales, total: totalGastosGenerales },
    utilidad,
    margen,
    canjes: { cantidad: canjes.length, total: sumar(canjes, 'valor') },
    transmisiones,
  };
}

module.exports = { obtenerResumen };
