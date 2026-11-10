import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography } from 'antd';
import PageHeader from '../components/ui/PageHeader';
import { obtenerGastos } from '../services/gastos.api';

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

  useEffect(() => {
    obtenerGastos()
      .then(setGastos)
      .catch(() => setError('No se pudieron cargar los gastos. ¿Está encendido el servidor?'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="p-2">
      <PageHeader
        title="Gastos Operativos"
        description="Aquí puedes gestionar y revisar los gastos operativos de la empresa."
      />
      {error && <Typography.Text type="danger">{error}</Typography.Text>}
      <Table
        rowKey="id"
        columns={columnas}
        dataSource={gastos}
        loading={cargando}
        pagination={false}
      />
    </div>
  );
};

export default GastosOperativos;
