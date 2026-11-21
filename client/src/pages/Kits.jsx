import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import KitModal from '../components/kits/KitsModal';
import { eliminarKit, obtenerKits } from '../services/kits.api';
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

const tiposRequeridos = [
  'CAMARA',
  'TRIPODE',
  'MICROFONO',
  'PANEL_SONIDO',
  'CABLE',
  'PANEL_SWITCH',
];

const ordenTipos = [...tiposRequeridos, 'OTRO'];

const normalizar = (texto) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const Kits = () => {
  const [kits, setKits] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCompletitud, setFiltroCompletitud] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [kitEditando, setKitEditando] = useState(null);
  const [mensaje, contextoMensaje] = message.useMessage();

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const [kitsCargados, equiposCargados] = await Promise.all([
        obtenerKits(),
        obtenerEquipos(),
      ]);
      setKits(kitsCargados);
      setEquipos(equiposCargados);
    } catch (errorCarga) {
      setError(errorCarga.message || 'No se pudieron cargar los kits y equipos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirCreacion = () => {
    setKitEditando(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (kit) => {
    setKitEditando(kit);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setKitEditando(null);
  };

  const eliminar = async (id) => {
    try {
      await eliminarKit(id);
      mensaje.success('Kit eliminado. Sus equipos quedaron sin asignar.');
      await cargarDatos();
    } catch (errorEliminacion) {
      mensaje.error(errorEliminacion.message || 'No se pudo eliminar el kit.');
    }
  };

  const kitsFiltrados = kits.filter((kit) => {
    const coincideNombre = normalizar(kit.nombre).includes(normalizar(filtroNombre));
    const coincideCompletitud =
      !filtroCompletitud ||
      (filtroCompletitud === 'completo' ? kit.completo : !kit.completo);

    return coincideNombre && coincideCompletitud;
  });

  const columnas = [
    { title: 'Nombre del Kit', dataIndex: 'nombre', key: 'nombre', width: 200 },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      render: (descripcion) => descripcion || '—',
    },
    {
      title: 'Equipos',
      dataIndex: 'equipos',
      key: 'equipos',
      width: 480,
      render: (equiposKit = []) => (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {equiposKit.length
            ? [...equiposKit]
                .sort(
                  (equipoA, equipoB) =>
                    ordenTipos.indexOf(equipoA.tipo) -
                      ordenTipos.indexOf(equipoB.tipo) ||
                    equipoA.nombre.localeCompare(equipoB.nombre),
                )
                .map((equipo) => (
                  <li key={equipo.id}>
                    <strong>{etiquetasTipo[equipo.tipo] ?? equipo.tipo}:</strong>{' '}
                    {equipo.nombre} · {equipo.modelo}
                  </li>
                ))
            : <li>Sin equipos</li>}
        </ul>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'completo',
      key: 'completo',
      width: 130,
      render: (completo) => (
        <Tag color={completo ? 'green' : 'orange'}>
          {completo ? 'Completo' : 'Incompleto'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 110,
      render: (_, kit) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<Pencil size={16} />}
            aria-label={`Editar kit ${kit.nombre}`}
            onClick={() => abrirEdicion(kit)}
          />
          <Popconfirm
            title="¿Eliminar este kit?"
            description="Sus equipos quedarán sin asignar."
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => eliminar(kit.id)}
          >
            <Button
              type="text"
              danger
              icon={<Trash2 size={16} />}
              aria-label={`Eliminar kit ${kit.nombre}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2">
      {contextoMensaje}

      <PageHeader
        title="Kits"
        description="Crea y administra kits con equipos disponibles del inventario."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={abrirCreacion}>
          Nuevo kit
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
          placeholder="Filtrar por estado"
          value={filtroCompletitud || undefined}
          onChange={(valor) => setFiltroCompletitud(valor ?? '')}
          style={{ width: 220 }}
          options={[
            { value: 'completo', label: 'Completo' },
            { value: 'incompleto', label: 'Incompleto' },
          ]}
        />
      </div>

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      <Table
        style={{ width: '100%' }}
        scroll={{ x: 1000 }}
        tableLayout="fixed"
        rowKey="id"
        columns={columnas}
        dataSource={kitsFiltrados}
        loading={cargando}
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: kits.length
            ? 'Ningún kit coincide con los filtros'
            : 'Aún no hay kits creados',
        }}
      />

      <KitModal
        abierto={modalAbierto}
        kit={kitEditando}
        equipos={equipos}
        onCerrar={cerrarModal}
        onGuardado={cargarDatos}
      />
    </div>
  );
};

export default Kits;
