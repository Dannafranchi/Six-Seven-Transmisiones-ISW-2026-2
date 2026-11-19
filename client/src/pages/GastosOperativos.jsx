import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Input, Select, Table, Tag, Typography } from 'antd';
import { Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { obtenerGastos } from '../services/gastos.api';
import NuevoGastoModal from '../components/gastos/NuevoGastoModal';
import { etiquetasTipoGasto } from '../components/gastos/etiquetasTipoGasto';
import { apiUrl } from '../services/api';

const formatoPesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const formatoFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC' });

// Para buscar sin importar tildes ni mayúsculas ("alimentacion" encuentra "Alimentación").
const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// Opciones del filtro de tipo, separadas en dos grupos (hay un "Otro" en cada uno).
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
  const [filtroDescripcion, setFiltroDescripcion] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(null);

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

  // Se calcula en cada render a partir de todos los gastos: no se guarda en el estado.
  const gastosFiltrados = gastos.filter((gasto) => {
    const coincideDescripcion = normalizar(gasto.descripcion).includes(normalizar(filtroDescripcion));
    const coincideTipo = !filtroTipo || gasto.tipo === filtroTipo;
    const coincideFecha = !filtroFecha || gasto.fecha.slice(0, 10) === filtroFecha.format('YYYY-MM-DD');
    return coincideDescripcion && coincideTipo && coincideFecha;
  });

  return (
    <div className="p-2">
      <PageHeader
        title="Gastos Operativos"
        description="Aquí puedes gestionar y revisar los gastos operativos de la empresa."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" onClick={() => setModalAbierto(true)}>
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
        columns={columnas}
        dataSource={gastosFiltrados}
        loading={cargando}
        pagination={{ pageSize: 8 }}
        locale={{
          emptyText: gastos.length ? 'Ningún gasto coincide con los filtros' : 'Aún no hay gastos registrados',
        }}
      />

      <NuevoGastoModal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        onCreado={cargarGastos}
      />
    </div>
  );
};

export default GastosOperativos;
