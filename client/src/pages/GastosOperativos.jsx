import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Input, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { eliminarGasto, obtenerGastos } from '../services/gastos.api';
import GastoModal from '../components/gastos/GastoModal';
import { etiquetasTipoGasto } from '../components/gastos/etiquetasTipoGasto';
import { apiUrl } from '../services/api';

const formatoPesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const formatoFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC' });

const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const tiposConPrefijo = (prefijo) =>
  Object.entries(etiquetasTipoGasto)
    .filter(([valor]) => valor.startsWith(prefijo))
    .map(([valor, etiqueta]) => ({ value: valor, label: etiqueta }));

const opcionesTipo = [
  { label: 'Gastos generales', options: tiposConPrefijo('GENERAL_') },
  { label: 'Gastos de transmisión', options: tiposConPrefijo('TRANSMISION_') },
];

const columnas = [
  {
    title: 'Fecha',
    dataIndex: 'fecha',
    key: 'fecha',
    render: (fecha) => formatoFecha.format(new Date(fecha)),
  },
  { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', render: (tipo) => etiquetasTipoGasto[tipo] ?? tipo },
  { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion' },
  {
    title: 'Transmisión',
    dataIndex: 'transmision',
    key: 'transmision',
    render: (transmision) =>
      transmision ? <Tag color="blue">{transmision.nombre}</Tag> : <Tag>General</Tag>,
  },
  {
    title: 'Valor',
    dataIndex: 'valor',
    key: 'valor',
    align: 'right',
    render: (valor) => formatoPesos.format(valor),
  },
  {
    title: 'Comprobante',
    dataIndex: 'comprobante',
    key: 'comprobante',
    align: 'center',
    render: (comprobante) =>
      comprobante ? (
        <a href={apiUrl(`/comprobantes/${comprobante}`)} target="_blank" rel="noreferrer">
          Ver
        </a>
      ) : (
        '—'
      ),
  },
];

const GastosOperativos = () => {
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [gastoEditando, setGastoEditando] = useState(null);
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(null);
  const [mensaje, contextoMensaje] = message.useMessage();

  const cargarGastos = () => {
    setCargando(true);
    setError(null);
    obtenerGastos()
      .then(setGastos)
      .catch(() => setError('No se pudieron cargar los gastos. ¿Está encendido el servidor?'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarGastos();
  }, []);

  const abrirNuevo = () => {
    setGastoEditando(null);
    setModalAbierto(true);
  };

  const abrirEditar = (gasto) => {
    setGastoEditando(gasto);
    setModalAbierto(true);
  };

  const eliminar = async (id) => {
    try {
      await eliminarGasto(id);
      setGastos((actuales) => actuales.filter((gasto) => gasto.id !== id));
      mensaje.success('Gasto eliminado');
    } catch {
      mensaje.error('No se pudo eliminar el gasto');
    }
  };

  const columnasConAcciones = [
    ...columnas,
    {
      title: 'Acciones',
      key: 'acciones',
      align: 'center',
      render: (_, gasto) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<Pencil size={16} />}
            aria-label="Editar gasto"
            onClick={() => abrirEditar(gasto)}
          />
          <Popconfirm
            title="¿Eliminar este gasto?"
            description="Esta acción no se puede deshacer."
            okText="Eliminar"
            cancelText="Cancelar"
            okButtonProps={{ danger: true }}
            onConfirm={() => eliminar(gasto.id)}
          >
            <Button type="text" danger icon={<Trash2 size={16} />} aria-label="Eliminar gasto" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const gastosFiltrados = gastos.filter((gasto) => {
    const coincideDescripcion = normalizar(gasto.descripcion).includes(normalizar(filtroDescripcion));
    const coincideTipo = !filtroTipo || gasto.tipo === filtroTipo;
    const coincideFecha = !filtroFecha || gasto.fecha.slice(0, 10) === filtroFecha.format('YYYY-MM-DD');
    return coincideDescripcion && coincideTipo && coincideFecha;
  });

  return (
    <div className="p-2">
      {contextoMensaje}
      <PageHeader
        title="Gastos Operativos"
        description="Aquí puedes gestionar y revisar los gastos operativos de la empresa."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={abrirNuevo}>
          Nuevo Gasto
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
        <DatePicker
          placeholder="Filtrar por fecha"
          format="DD-MM-YYYY"
          value={filtroFecha}
          onChange={setFiltroFecha}
          style={{ width: 200 }}
        />

        <Input
          allowClear
          placeholder="Buscar por descripción"
          value={filtroDescripcion}
          onChange={(evento) => setFiltroDescripcion(evento.target.value)}
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
        rowKey="id"
        columns={columnasConAcciones}
        dataSource={gastosFiltrados}
        loading={cargando}
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: gastos.length ? 'Ningún gasto coincide con los filtros' : 'Aún no hay gastos registrados',
        }}
      />

      <GastoModal
        abierto={modalAbierto}
        gasto={gastoEditando}
        onCerrar={() => setModalAbierto(false)}
        onGuardado={cargarGastos}
      />
    </div>
  );
};

export default GastosOperativos;
