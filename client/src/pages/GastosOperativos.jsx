import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Typography } from 'antd';
import { Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { obtenerGastos } from '../services/gastos.api';
import NuevoGastoModal from '../components/gastos/NuevoGastoModal';


const formatoPesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });
const formatoFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC' });

const columnas = [
  {
    title: 'Fecha',
    dataIndex: 'fecha',
    key: 'fecha',
    render: (fecha) => formatoFecha.format(new Date(fecha)),
  },
  { title: 'Tipo', dataIndex: 'tipo', key: 'tipo' },
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
];

const GastosOperativos = () => {
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

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

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      <Table
        rowKey="id"
        columns={columnas}
        dataSource={gastos}
        loading={cargando}
        pagination={false}
        locale={{ emptyText: 'Aún no hay gastos registrados' }}
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
