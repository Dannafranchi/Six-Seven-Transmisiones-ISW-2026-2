const prisma = require('../config/prisma');

async function listarEquipos() {
  const equipos = await prisma.equipo.findMany({
    where: { archivadoAt: null },
    orderBy: { createdAt: 'desc' },
  });

  return equipos.map((equipo) => ({
    ...equipo,
    precioCompra: Number(equipo.precioCompra),
  }));
}

async function crearEquipo(datos) {
  const equipo = await prisma.equipo.create({
    data: {
      nombre: datos.nombre.trim(),
      modelo: datos.modelo.trim(),
      anio: datos.anio ?? null,
      precioCompra: String(datos.precioCompra),
      tipo: datos.tipo,
    },
  });

  return {
    ...equipo,
    precioCompra: Number(equipo.precioCompra),
  };
}

module.exports = { listarEquipos, crearEquipo };