import React, { useEffect, useState } from 'react';
import { Alert, DatePicker, Table, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import PageHeader from '../components/ui/PageHeader';
import { obtenerMermasPorPeriodo } from '../services/mermas.api';

const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' });
const formatoPesos = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});
const etiquetasTipoEquipo = {
  CAMARA: 'Cámara',
  TRIPODE: 'Trípode',
  MICROFONO: 'Micrófono',
  PANEL_SONIDO: 'Panel de sonido',
  CABLE: 'Cable',
  PANEL_SWITCH: 'Panel switch',
  OTRO: 'Otro',
};

const Mermas = () => {
  const [mes, setMes] = useState(() => dayjs());
  const [datos, setDatos] = useState({ inhabilitaciones: [], reparaciones: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    const desde = mes.startOf('month').toISOString();
    const hasta = mes.add(1, 'month').startOf('month').toISOString();

    setCargando(true);
    setError(null);
    obtenerMermasPorPeriodo(desde, hasta)
      .then((resultado) => {
        if (!cancelado) setDatos(resultado);
      })
      .catch((errorCarga) => {
        if (!cancelado) {
          setError(errorCarga.message || 'No se pudo cargar el reporte mensual.');
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [mes]);

  const columnasInhabilitaciones = [
    {
      title: 'Equipo',
      key: 'equipo',
      render: (_, evento) => <Typography.Text strong>{evento.equipo.nombre}</Typography.Text>,
    },
    {
      title: 'Tipo de equipo',
      key: 'tipoEquipo',
      render: (_, evento) => etiquetasTipoEquipo[evento.equipo.tipo] ?? evento.equipo.tipo,
    },
    {
      title: 'Fecha de inhabilitación',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha) => formatoFecha.format(new Date(fecha)),
    },
    {
      title: 'Pérdida total',
      dataIndex: 'montoPerdida',
      key: 'montoPerdida',
      align: 'right',
      render: (monto) => <Typography.Text strong>{formatoPesos.format(monto)}</Typography.Text>,
    },
  ];

  const columnasReparaciones = [
    {
      title: 'Equipo',
      key: 'equipo',
      render: (_, reparacion) => (
        <Typography.Text strong>{reparacion.equipo.nombre}</Typography.Text>
      ),
    },
    {
      title: 'Tipo de equipo',
      key: 'tipoEquipo',
      render: (_, reparacion) =>
        etiquetasTipoEquipo[reparacion.equipo.tipo] ?? reparacion.equipo.tipo,
    },
    {
      title: 'Inicio de reparación',
      dataIndex: 'fechaInicio',
      key: 'fechaInicio',
      render: (fecha) => formatoFecha.format(new Date(fecha)),
    },
    {
      title: 'Fin de reparación',
      dataIndex: 'fechaFin',
      key: 'fechaFin',
      render: (fecha) =>
        fecha ? formatoFecha.format(new Date(fecha)) : <Tag color="orange">En reparación</Tag>,
    },
    {
      title: 'Costo',
      dataIndex: 'costo',
      key: 'costo',
      align: 'right',
      render: (monto) => (monto === null ? '—' : formatoPesos.format(monto)),
    },
  ];

  const perdidaMensual = datos.inhabilitaciones.reduce(
    (total, evento) => total + evento.montoPerdida,
    0,
  );

  return (
    <div className="p-2">
      <PageHeader
        title="Mermas"
        description="Consulta equipos inhabilitados y reparaciones por mes."
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
        <Typography.Text strong>Mes del reporte</Typography.Text>
        <DatePicker
          picker="month"
          format="MM/YYYY"
          value={mes}
          allowClear={false}
          onChange={(nuevoMes) => {
            if (nuevoMes) setMes(nuevoMes);
          }}
        />
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="No se pudo cargar el reporte"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      <Typography.Title level={4}>Equipos inhabilitados</Typography.Title>
      <Typography.Paragraph>
        Pérdida total del mes: <strong>{formatoPesos.format(perdidaMensual)}</strong>
      </Typography.Paragraph>
      <Table
        rowKey="id"
        columns={columnasInhabilitaciones}
        dataSource={datos.inhabilitaciones}
        loading={cargando}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 800 }}
        locale={{ emptyText: 'No hubo inhabilitaciones durante este mes.' }}
      />

      <Typography.Title level={4}>Reparaciones</Typography.Title>
      <Table
        rowKey="id"
        columns={columnasReparaciones}
        dataSource={datos.reparaciones}
        loading={cargando}
        pagination={{ pageSize: 8 }}
        scroll={{ x: 850 }}
        locale={{ emptyText: 'No hubo equipos en reparación durante este mes.' }}
      />
    </div>
  );
};

export default Mermas;