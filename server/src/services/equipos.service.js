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

async function actualizarEquipo(id, datos) {
  const resultado = await prisma.equipo.updateMany({
    where: { id, archivadoAt: null },
    data: {
      nombre: datos.nombre.trim(),
      modelo: datos.modelo.trim(),
      anio: datos.anio ?? null,
      precioCompra: String(datos.precioCompra),
      tipo: datos.tipo,
    },
  });

  if (resultado.count === 0) return null;

  const equipo = await prisma.equipo.findUnique({ where: { id } });

  if (!equipo) return null;

  return {
    ...equipo,
    precioCompra: Number(equipo.precioCompra),
  };
}

async function archivarEquipo(id) {
  const resultado = await prisma.equipo.updateMany({
    where: { id, archivadoAt: null },
    data: { archivadoAt: new Date() },
  });

  return resultado.count > 0;
}

module.exports = {
  listarEquipos,
  crearEquipo,
  actualizarEquipo,
  archivarEquipo,
};