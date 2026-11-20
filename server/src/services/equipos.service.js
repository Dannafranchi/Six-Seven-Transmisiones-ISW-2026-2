const prisma = require('../config/prisma');

const incluirReparaciones = {
  reparaciones: {
    select: {
      id: true,
      fechaInicio: true,
      fechaFin: true,
      costo: true,
      descripcion: true,
    },
  },
};

function presentarEquipo(equipo) {
  const reparaciones = equipo.reparaciones ?? [];
  const precioCompra = Number(equipo.precioCompra);
  const costoReparaciones = reparaciones.reduce(
    (total, reparacion) => total + Number(reparacion.costo ?? 0),
    0,
  );

  return {
    ...equipo,
    precioCompra,
    reparaciones: reparaciones.map((reparacion) => ({
      ...reparacion,
      costo: reparacion.costo === null ? null : Number(reparacion.costo),
    })),
    costoReparaciones,
    costoTotal: precioCompra + costoReparaciones,
  };
}

function errorConEstado(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function listarEquipos() {
  const equipos = await prisma.equipo.findMany({
    where: { archivadoAt: null },
    orderBy: { createdAt: 'desc' },
    include: incluirReparaciones,
  });

  return equipos.map(presentarEquipo);
}

async function crearEquipo(datos) {
  const equipo = await prisma.equipo.create({
    data: {
      nombre: datos.nombre,
      modelo: datos.modelo,
      anio: datos.anio ?? null,
      precioCompra: String(datos.precioCompra),
      tipo: datos.tipo,
    },
    include: incluirReparaciones,
  });

  return presentarEquipo(equipo);
}

async function actualizarEquipo(id, datos) {
  const resultado = await prisma.equipo.updateMany({
    where: { id, archivadoAt: null },
    data: {
      nombre: datos.nombre,
      modelo: datos.modelo,
      anio: datos.anio ?? null,
      precioCompra: String(datos.precioCompra),
      tipo: datos.tipo,
    },
  });

  if (resultado.count === 0) return null;

  const equipo = await prisma.equipo.findUnique({
    where: { id },
    include: incluirReparaciones,
  });

  return equipo ? presentarEquipo(equipo) : null;
}

async function iniciarReparacion(id) {
  return prisma.$transaction(async (tx) => {
    const equipo = await tx.equipo.findFirst({
      where: { id, archivadoAt: null },
      select: { id: true, estado: true },
    });

    if (!equipo) return null;

    const reparacionAbierta = await tx.reparacionEquipo.findFirst({
      where: { equipoId: id, fechaFin: null },
      select: { id: true },
    });

    if (equipo.estado === 'EN_REPARACION' || reparacionAbierta) {
      throw errorConEstado(409, 'El equipo ya tiene una reparación abierta.');
    }

    await tx.reparacionEquipo.create({
      data: {
        equipoId: id,
        fechaInicio: new Date(),
      },
    });

    const equipoActualizado = await tx.equipo.update({
      where: { id },
      data: { estado: 'EN_REPARACION' },
      include: incluirReparaciones,
    });

    return presentarEquipo(equipoActualizado);
  });
}

async function cerrarReparacion(id, datos) {
  return prisma.$transaction(async (tx) => {
    const equipo = await tx.equipo.findFirst({
      where: { id, archivadoAt: null },
      select: { id: true, estado: true },
    });

    if (!equipo) return null;

    const reparacion = await tx.reparacionEquipo.findFirst({
      where: { equipoId: id, fechaFin: null },
      orderBy: { fechaInicio: 'desc' },
    });

    if (!reparacion || equipo.estado !== 'EN_REPARACION') {
      throw errorConEstado(409, 'El equipo no tiene una reparación abierta.');
    }

    await tx.reparacionEquipo.update({
      where: { id: reparacion.id },
      data: {
        fechaFin: new Date(),
        costo: String(datos.costo),
      },
    });

    const equipoActualizado = await tx.equipo.update({
      where: { id },
      data: { estado: datos.estadoFinal },
      include: incluirReparaciones,
    });

    return presentarEquipo(equipoActualizado);
  });
}

async function archivarEquipo(id) {
  return prisma.$transaction(async (tx) => {
    const equipo = await tx.equipo.findFirst({
      where: { id, archivadoAt: null },
      select: { id: true, estado: true },
    });

    if (!equipo) return false;

    const reparacionAbierta = await tx.reparacionEquipo.findFirst({
      where: { equipoId: id, fechaFin: null },
      select: { id: true },
    });

    if (equipo.estado === 'EN_REPARACION' || reparacionAbierta) {
      throw errorConEstado(409, 'Primero debes cerrar la reparación del equipo.');
    }

    const resultado = await tx.equipo.updateMany({
      where: { id, archivadoAt: null },
      data: { archivadoAt: new Date() },
    });

    return resultado.count > 0;
  });
}

async function cambiarEstadoDirecto(id, estadoNuevo) {
  return prisma.$transaction(async (tx) => {
    const equipo = await tx.equipo.findFirst({
      where: { id, archivadoAt: null },
      select: { id: true, estado: true },
    });

    if (!equipo) return null;

    const reparacionAbierta = await tx.reparacionEquipo.findFirst({
      where: { equipoId: id, fechaFin: null },
      select: { id: true },
    });

    if (equipo.estado === 'EN_REPARACION' || reparacionAbierta) {
      throw errorConEstado(409, 'Primero debes cerrar la reparación abierta.');
    }

    const transicionPermitida =
      (equipo.estado === 'BUENO' && estadoNuevo === 'INHABILITADO') ||
      (equipo.estado === 'INHABILITADO' && estadoNuevo === 'BUENO');

    if (!transicionPermitida) {
      throw errorConEstado(409, 'Ese cambio de estado no está permitido directamente.');
    }

    const actualizado = await tx.equipo.update({
      where: { id },
      data: { estado: estadoNuevo },
      include: incluirReparaciones,
    });

    return presentarEquipo(actualizado);
  });
}
module.exports = {
  listarEquipos,
  crearEquipo,
  actualizarEquipo,
  iniciarReparacion,
  cerrarReparacion,
  archivarEquipo,
  cambiarEstadoDirecto,
};