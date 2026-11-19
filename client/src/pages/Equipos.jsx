import React, { useEffect, useState } from 'react';
import { Button, Input, Select, Table, Tag, Typography, message } from 'antd';
import PageHeader from '../components/ui/PageHeader';
import EquipoAcciones from '../components/equipos/EquipoAcciones';
import EquipoModal from '../components/equipos/EquipoModal.jsx';
import { obtenerEquipos } from '../services/equipos.api';

const etiquetasTipo = {
  CAMARA: 'Cámara',
  TRIPODE: 'Trípode',
  MICROFONO: 'Micrófono',
  PANEL_SONIDO: 'Panel de sonido',
  CABLE: 'Cable',
  PANEL_SWITCH: 'Panel switch',
  OTRO: 'Otro',
};

const etiquetasEstado = {
  BUENO: 'Bueno',
  EN_REPARACION: 'En reparación',
  INHABILITADO: 'Inhabilitado',
};

const coloresEstado = {
  BUENO: 'green',
  EN_REPARACION: 'orange',
  INHABILITADO: 'red',
};

const opcionesTipo = Object.entries(etiquetasTipo).map(([value, label]) => ({ value, label }));

const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const opcionesEstado = Object.entries(etiquetasEstado).map(([value, label]) => ({ value, label }));

const formatoPesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState(null);
  const [mensaje, contextoMensaje] = message.useMessage();

  const cargarEquipos = () => {
    setCargando(true);
    setError(null);

    return obtenerEquipos()
      .then(setEquipos)
      .catch((errorCarga) => {
        setError(errorCarga.message || 'No se pudieron cargar los equipos.');
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  const abrirCreacion = () => {
    setEquipoEditando(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (equipo) => {
    setEquipoEditando(equipo);
    setModalAbierto(true);
  };

  const cerrarModalEquipo = () => {
    setModalAbierto(false);
    setEquipoEditando(null);
  };

  const equiposFiltrados = equipos.filter((equipo) => {
    const coincideNombre = normalizar(equipo.nombre).includes(normalizar(filtroNombre));
    const coincideTipo = !filtroTipo || equipo.tipo === filtroTipo;

    return coincideNombre && coincideTipo;
  });

  const columnas = [
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', width: 200 },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 170,
      render: (tipo) => etiquetasTipo[tipo] ?? tipo,
    },
    {
      title: 'Precio',
      dataIndex: 'precioCompra',
      key: 'precioCompra',
      width: 150,
      render: (precio) => formatoPesos.format(Number(precio)),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 150,
      render: (estado) => (
        <Tag color={coloresEstado[estado] ?? 'default'}>
          {etiquetasEstado[estado] ?? estado}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 260,
      render: (_, equipo) => (
        <EquipoAcciones
          equipo={equipo}
          etiquetasEstado={etiquetasEstado}
          opcionesEstado={opcionesEstado}
          mensaje={mensaje}
          onEditar={() => abrirEdicion(equipo)}
          onGuardado={cargarEquipos}
        />
      ),
    },
  ];

  return (
    <div className="p-2">
      {contextoMensaje}

      <PageHeader
        title="Equipos"
        description="Gestiona los equipos del inventario."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={abrirCreacion}>
          Nuevo Equipo
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 12, margin: '20px 0', flexWrap: 'wrap' }}>
        <Input
          allowClear
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={(evento) => setFiltroNombre(evento.target.value)}
          style={{ maxWidth: 280 }}
        />
        <Select
          allowClear
          placeholder="Filtrar por tipo"
          value={filtroTipo || undefined}
          onChange={(tipo) => setFiltroTipo(tipo ?? '')}
          style={{ width: 240 }}
          options={opcionesTipo}
        />
      </div>

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      <Table
        style={{ width: '100%' }}
        scroll={{ x: 1000 }}
        tableLayout="fixed"
        rowKey="id"
        columns={columnas}
        dataSource={equiposFiltrados}
        loading={cargando}
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: equipos.length
            ? 'Ningún equipo coincide con los filtros'
            : 'Aún no hay equipos creados',
        }}
      />

      <EquipoModal
        abierto={modalAbierto}
        equipo={equipoEditando}
        opcionesTipo={opcionesTipo}
        onCerrar={cerrarModalEquipo}
        onGuardado={cargarEquipos}
      />
    </div>
  );
};

export default Equipos;