import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Card, Col, DatePicker, Row, Spin, Statistic, Table, Typography } from 'antd';
import { FileDown } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { obtenerResumen } from '../services/resumen.api';
import { armarEstadoResultados, formatearPesos } from '../components/resumen/estadoResultados';
import { exportarResumenPdf } from '../components/resumen/exportarResumenPdf';

const VERDE = '#389e0d';
const ROJO = '#cf1322';

const formatoMes = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });
const formatoFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC' });

const colorSegunSigno = (valor) => (valor < 0 ? ROJO : VERDE);

const filaBase = { display: 'flex', justifyContent: 'space-between', padding: '5px 0' };

const estilosFila = {
  seccion: { ...filaBase, paddingTop: 14, fontSize: 12, fontWeight: 600, color: '#595959', textTransform: 'uppercase' },
  detalle: { ...filaBase, paddingLeft: 14 },
  subtotal: { ...filaBase, fontWeight: 600, borderTop: '1px solid #f0f0f0' },
  resultado: { ...filaBase, fontWeight: 700, padding: '8px 10px', margin: '8px -10px 0', borderRadius: 6 },
  total: { ...filaBase, fontWeight: 700, fontSize: 16, padding: 10, margin: '12px -10px 0', borderRadius: 6, border: '1px solid' },
};

const estiloFila = (fila) => {
  const estilo = estilosFila[fila.tipo];
  if (fila.tipo !== 'resultado' && fila.tipo !== 'total') return estilo;
  const negativo = fila.valor < 0;
  return { ...estilo, background: negativo ? '#fff1f0' : '#f6ffed', borderColor: negativo ? '#ffa39e' : '#b7eb8f' };
};

const colorValor = (fila) =>
  fila.tipo === 'resultado' || fila.tipo === 'total' ? colorSegunSigno(fila.valor) : undefined;

const textoMargen = (margen) => {
  if (margen === null) return 'Sin ingresos este mes';
  if (margen < 0) return `De cada $100 que entran, se pierden $${Math.round(-margen)}`;
  return `De cada $100 que entran, quedan $${Math.round(margen)}`;
};

const columnas = [
  {
    title: 'Transmisión',
    key: 'transmision',
    render: (_, transmision) => (
      <>
        <div style={{ fontWeight: 500 }}>{transmision.nombre}</div>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {formatoFecha.format(new Date(transmision.fecha))}
        </Typography.Text>
      </>
    ),
  },
  { title: 'Ingresos', dataIndex: 'ingresos', align: 'right', render: formatearPesos },
  { title: 'Gastos', dataIndex: 'gastos', align: 'right', render: formatearPesos },
  { title: 'Personal', dataIndex: 'remuneraciones', align: 'right', render: formatearPesos },
  {
    title: 'Ganancia',
    dataIndex: 'ganancia',
    align: 'right',
    render: (ganancia) => (
      <span style={{ color: colorSegunSigno(ganancia), fontWeight: 600 }}>{formatearPesos(ganancia)}</span>
    ),
  },
];

const Tarjeta = ({ titulo, valor, ayuda, color }) => (
  <Card style={{ height: '100%' }}>
    <Statistic title={titulo} value={valor} styles={{ content: { color, fontWeight: 600 } }} />
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      {ayuda}
    </Typography.Text>
  </Card>
);

const Resumen = () => {
  const [mes, setMes] = useState(dayjs());
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    obtenerResumen(mes.format('YYYY-MM'))
      .then((datos) => vigente && setResumen(datos))
      .catch(() => vigente && setError('No se pudo cargar el resumen. ¿Está encendido el servidor?'))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [mes]);

  return (
    <div className="p-2">
      <PageHeader
        title="Resumen del Mes"
        description="Ingresos, costos y utilidad del mes, con la ganancia de cada transmisión."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<FileDown size={16} />}
          disabled={!resumen || cargando}
          onClick={() => exportarResumenPdf(resumen)}
        >
          Exportar PDF
        </Button>
      </div>


      <div style={{ display: 'flex', gap: 12, margin: '20px 0', alignItems: 'center' }}>
        <span>Mes:</span>
        <DatePicker
          picker="month"
          value={mes}
          onChange={setMes}
          format={(valor) => formatoMes.format(valor.toDate())}
          allowClear={false}
          inputReadOnly
          style={{ width: 220 }}
        />
      </div>

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      <Spin spinning={cargando}>
        {resumen && (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} xl={6}>
              <Tarjeta
                titulo="Ingresos del mes"
                valor={formatearPesos(resumen.ingresos.total)}
                ayuda="Cobro por transmisiones + auspicios monetarios"
              />
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Tarjeta
                titulo="Costos y gastos"
                valor={formatearPesos(resumen.costos.total + resumen.gastosGenerales.total)}
                ayuda="Transmisiones, personal y gastos generales"
              />
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Tarjeta
                titulo="Utilidad del mes"
                valor={formatearPesos(resumen.utilidad)}
                color={colorSegunSigno(resumen.utilidad)}
                ayuda="Ingresos − costos y gastos"
              />
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Tarjeta
                titulo="Margen de utilidad"
                valor={resumen.margen === null ? '—' : `${resumen.margen.toLocaleString('es-CL')} %`}
                color={resumen.margen === null ? undefined : colorSegunSigno(resumen.margen)}
                ayuda={textoMargen(resumen.margen)}
              />
            </Col>

            <Col xs={24} xl={10}>
              <Card
                title="Estado de resultados"
                extra={<Typography.Text type="secondary">{formatoMes.format(dayjs(resumen.mes).toDate())}</Typography.Text>}
              >
                {armarEstadoResultados(resumen).map((fila) => (
                  <div key={fila.texto} style={estiloFila(fila)}>
                    <span>{fila.texto}</span>
                    {fila.valor !== undefined && (
                      <span style={{ color: colorValor(fila) }}>{formatearPesos(fila.valor)}</span>
                    )}
                  </div>
                ))}
              </Card>
            </Col>

            <Col xs={24} xl={14}>
              <Card
                title="Ganancia por transmisión"
                extra={
                  <Typography.Text type="secondary">
                    {resumen.transmisiones.length} {resumen.transmisiones.length === 1 ? 'transmisión' : 'transmisiones'}
                  </Typography.Text>
                }
              >
                <Table
                  rowKey="id"
                  columns={columnas}
                  dataSource={resumen.transmisiones}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'No hay transmisiones en este mes' }}
                  summary={() =>
                    resumen.transmisiones.length > 0 && (
                      <Table.Summary.Row style={{ fontWeight: 600, background: '#fafafa' }}>
                        <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          {formatearPesos(resumen.ingresos.total)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} align="right">
                          {formatearPesos(resumen.costos.gastosTransmision)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3} align="right">
                          {formatearPesos(resumen.costos.remuneraciones)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4} align="right">
                          <span style={{ color: colorSegunSigno(resumen.resultadoTransmisiones) }}>
                            {formatearPesos(resumen.resultadoTransmisiones)}
                          </span>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    )
                  }
                />
              </Card>

              {resumen.canjes.cantidad > 0 && (
                <Alert
                  style={{ marginTop: 16 }}
                  type="info"
                  showIcon
                  title={`Auspicios en canje: ${resumen.canjes.cantidad} (valor estimado ${formatearPesos(resumen.canjes.total)})`}
                  description="No se suman a los ingresos porque no entran como dinero. Se muestran solo como dato."
                />
              )}
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default Resumen;
