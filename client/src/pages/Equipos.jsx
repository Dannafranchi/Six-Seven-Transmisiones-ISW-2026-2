import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Typography } from 'antd';
import PageHeader from '../components/ui/PageHeader';
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

const opcionesTipo = Object.entries(etiquetasTipo).map(([value, label]) => ({
  value,
  label,
}));

const formatoPesos = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const columnas = [
  { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', width: 220 },
  {
    title: 'Tipo',
    dataIndex: 'tipo',
    key: 'tipo',
    width: 180,
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
    width: 160,
    render: (estado) => (
      <Tag color={coloresEstado[estado] ?? 'default'}>
        {etiquetasEstado[estado] ?? estado}
      </Tag>
    ),
  },
];

const Equipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

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

  return (
    <div className="p-2">
      <PageHeader title="Equipos" description="Aqui puedes gestionar los equipos del inventario." />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalAbierto(true)}>
          Nuevo Equipo
        </Button>
      </div>

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      <Table
    style={{ width: 800 }}
    tableLayout="fixed"
    rowKey="id"
    columns={columnas}
    dataSource={equipos}
    loading={cargando}
    pagination={{ pageSize: 8 }}
    locale={{ emptyText: 'Aún no hay equipos creados' }}
      />

      <EquipoModal
        abierto={modalAbierto}
        opcionesTipo={opcionesTipo}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={cargarEquipos}
      />
    </div>
  );
};

export default Equipos;