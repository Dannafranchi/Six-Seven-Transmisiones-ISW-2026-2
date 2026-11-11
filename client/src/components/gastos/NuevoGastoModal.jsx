import React, { useEffect, useState } from 'react';
import { DatePicker, Form, Input, InputNumber, Modal, Segmented, Select, message } from 'antd';
import { crearGasto, obtenerOpciones } from '../../services/gastos.api';

const CATEGORIAS = [
  { label: 'Gasto general', value: 'general' },
  { label: 'Gasto de transmisión', value: 'transmision' },
];

const formatoFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC' });

const NuevoGastoModal = ({ abierto, onCerrar, onCreado }) => {
  const [form] = Form.useForm();
  const [mensaje, contextoMensaje] = message.useMessage();
  const [categoria, setCategoria] = useState('general');
  const [opciones, setOpciones] = useState({ tiposGeneral: [], tiposTransmision: [], transmisiones: [] });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    obtenerOpciones()
      .then(setOpciones)
      .catch(() => mensaje.error('No se pudieron cargar las opciones del formulario'));
  }, [abierto]);

  const cambiarCategoria = (valor) => {
    setCategoria(valor);
    form.setFieldsValue({ tipo: undefined, transmisionId: undefined, fecha: undefined });
  };

  const cerrar = () => {
    form.resetFields();
    setCategoria('general');
    onCerrar();
  };

  const guardar = async (valores) => {
    const datos = {
      tipo: valores.tipo,
      descripcion: valores.descripcion,
      valor: valores.valor,
    };

    if (categoria === 'general') {
      datos.fecha = valores.fecha.format('YYYY-MM-DD');
    } else {
      datos.transmisionId = valores.transmisionId;
    }

    setGuardando(true);
    try {
      await crearGasto(datos);
      mensaje.success('Gasto guardado');
      cerrar();
      onCreado();
    } catch {
      mensaje.error('No se pudo guardar el gasto. Revisa los datos e intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const tipos = categoria === 'general' ? opciones.tiposGeneral : opciones.tiposTransmision;

  return (
    <>
      {contextoMensaje}
      <Modal
        title="Nuevo Gasto"
        open={abierto}
        onCancel={cerrar}
        onOk={() => form.submit()}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={guardando}
      >
        <Form form={form} layout="vertical" onFinish={guardar}>
          <Form.Item label="¿Qué tipo de gasto es?">
            <Segmented options={CATEGORIAS} value={categoria} onChange={cambiarCategoria} block />
          </Form.Item>

          {categoria === 'transmision' && (
            <Form.Item
              name="transmisionId"
              label="Transmisión"
              rules={[{ required: true, message: 'Elige la transmisión' }]}
            >
              <Select
                placeholder="Elige una transmisión"
                options={opciones.transmisiones.map((t) => ({
                  value: t.id,
                  label: `${t.nombre} (${formatoFecha.format(new Date(t.fecha))})`,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Elige el tipo de gasto' }]}>
            <Select placeholder="Elige un tipo" options={tipos.map((t) => ({ value: t, label: t }))} />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[
              { required: true, whitespace: true, message: 'Escribe una descripción' },
              { max: 255, message: 'Máximo 255 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Arriendo oficina diciembre" />
          </Form.Item>

         <Form.Item
            name="valor"
            label="Valor (CLP)"
            rules={[
              { required: true, message: 'Escribe el valor' },
              { type: 'integer', message: 'El valor debe ser un número entero' },
              { type: 'number', min: 1, message: 'El valor debe ser mayor que 0' },
            ]}
        >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Ej: 350000"
              formatter={(valor) => `${valor}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(texto) => texto.replace(/\./g, '')}
            />
        </Form.Item>


          {categoria === 'general' && (
            <Form.Item name="fecha" label="Fecha" rules={[{ required: true, message: 'Elige la fecha' }]}>
              <DatePicker
                format="DD-MM-YYYY"
                style={{ width: '100%' }}
                disabledDate={(fecha) => fecha.isAfter(new Date(), 'day')}
              />

            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default NuevoGastoModal;
