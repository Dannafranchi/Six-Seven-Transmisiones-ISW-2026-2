const prisma = require('../config/prisma');
const { EstadoEquipo, TipoEquipo } = require('@prisma/client');

const tiposRequeridos = [
  TipoEquipo.CAMARA,
  TipoEquipo.TRIPODE,
  TipoEquipo.MICROFONO,
  TipoEquipo.PANEL_SONIDO,
  TipoEquipo.CABLE,
  TipoEquipo.PANEL_SWITCH,
];

const nombresTipos = {
  [TipoEquipo.CAMARA]: 'cámara',
  [TipoEquipo.TRIPODE]: 'trípode',
  [TipoEquipo.MICROFONO]: 'micrófono',
  [TipoEquipo.PANEL_SONIDO]: 'panel de sonido',
  [TipoEquipo.CABLE]: 'cable',
  [TipoEquipo.PANEL_SWITCH]: 'panel de switch',
};

const incluirEquipos = {
  equipos: {
    orderBy: { createdAt: 'asc' },
  },
};

function errorConEstado(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function presentarKit(kit) {
  const equiposDisponibles = (kit.equipos ?? []).filter(
    (equipo) =>
      equipo.estado === EstadoEquipo.BUENO && equipo.archivadoAt === null,
  );
  const tiposDisponibles = new Set(equiposDisponibles.map((equipo) => equipo.tipo));

  return {
    ...kit,
    completo: tiposRequeridos.every((tipo) => tiposDisponibles.has(tipo)),
  };
}

async function validarEquipos(tx, equipoIds, kitIdActual = null) {
  const equipos = await tx.equipo.findMany({
    where: { id: { in: equipoIds } },
    select: {
      id: true,
      tipo: true,
      estado: true,
      archivadoAt: true,
      kitId: true,
    },
  });

  if (equipos.length !== equipoIds.length) {
    throw errorConEstado(404, 'Uno o más equipos seleccionados no existen.');
  }

  if (
    equipos.some(
      (equipo) =>
        equipo.estado !== EstadoEquipo.BUENO || equipo.archivadoAt !== null,
    )
  ) {
    throw errorConEstado(409, 'Solo puedes agregar equipos disponibles y no archivados.');
  }

  if (equipos.some((equipo) => equipo.kitId && equipo.kitId !== kitIdActual)) {
    throw errorConEstado(409, 'Uno o más equipos ya pertenecen a otro kit.');
  }

  const tiposSeleccionados = new Set(equipos.map((equipo) => equipo.tipo));
  const tiposFaltantes = tiposRequeridos.filter(
    (tipo) => !tiposSeleccionados.has(tipo),
  );

  if (tiposFaltantes.length > 0) {
    const nombresFaltantes = tiposFaltantes.map((tipo) => nombresTipos[tipo]);
    throw errorConEstado(
      400,
      `El kit debe incluir al menos un equipo de cada tipo obligatorio. Faltan: ${nombresFaltantes.join(', ')}.`,
    );
  }
}

async function listarKits() {
  const kits = await prisma.kit.findMany({
    orderBy: { createdAt: 'desc' },
    include: incluirEquipos,
  });

  return kits.map(presentarKit);
}

async function crearKit(datos) {
  return prisma.$transaction(async (tx) => {
    await validarEquipos(tx, datos.equipoIds);

    const kit = await tx.kit.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion || null,
      },
    });

    const asignacion = await tx.equipo.updateMany({
      where: {
        id: { in: datos.equipoIds },
        kitId: null,
        estado: EstadoEquipo.BUENO,
        archivadoAt: null,
      },
      data: { kitId: kit.id },
    });

    if (asignacion.count !== datos.equipoIds.length) {
      throw errorConEstado(
        409,
        'Uno o más equipos dejaron de estar disponibles para el kit.',
      );
    }

    const kitCreado = await tx.kit.findUnique({
      where: { id: kit.id },
      include: incluirEquipos,
    });

    return presentarKit(kitCreado);
  });
}

async function actualizarKit(id, datos) {
  return prisma.$transaction(async (tx) => {
    const kitExistente = await tx.kit.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!kitExistente) return null;

    await validarEquipos(tx, datos.equipoIds, id);

    await tx.kit.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion || null,
      },
    });

    const asignacion = await tx.equipo.updateMany({
      where: {
        id: { in: datos.equipoIds },
        estado: EstadoEquipo.BUENO,
        archivadoAt: null,
        OR: [{ kitId: null }, { kitId: id }],
      },
      data: { kitId: id },
    });

    if (asignacion.count !== datos.equipoIds.length) {
      throw errorConEstado(
        409,
        'Uno o más equipos dejaron de estar disponibles para el kit.',
      );
    }

    await tx.equipo.updateMany({
      where: {
        kitId: id,
        id: { notIn: datos.equipoIds },
      },
      data: { kitId: null },
    });

    const kitActualizado = await tx.kit.findUnique({
      where: { id },
      include: incluirEquipos,
    });

    return presentarKit(kitActualizado);
  });
}

async function eliminarKit(id) {
  const resultado = await prisma.kit.deleteMany({ where: { id } });
  return resultado.count > 0;
}

module.exports = {
  listarKits,
  crearKit,
  actualizarKit,
  eliminarKit,
};