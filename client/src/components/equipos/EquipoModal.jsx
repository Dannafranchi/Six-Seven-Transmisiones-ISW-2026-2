import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Modal, Select, message } from 'antd';
import { crearEquipo } from '../../services/equipos.api';

const anioActual = new Date().getFullYear();

const EquipoModal = ({ abierto, opcionesTipo, onCerrar, onGuardado }) => {
  const [form] = Form.useForm();
  const [mensaje, contextoMensaje] = message.useMessage();
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto) form.resetFields();
  }, [abierto, form]);

  const cerrar = () => {
    form.resetFields();
    onCerrar();
  };

  const guardar = async (valores) => {
    setGuardando(true);

    try {
      await crearEquipo({
        ...valores,
        nombre: valores.nombre.trim(),
        modelo: valores.modelo.trim(),
        anio: valores.anio ?? null,
      });
      mensaje.success('Equipo creado');
      cerrar();
      await onGuardado();
    } catch (error) {
      mensaje.error(error.message || 'No se pudo crear el equipo');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {contextoMensaje}
      <Modal
        title="Nuevo Equipo"
        open={abierto}
        onCancel={cerrar}
        onOk={() => form.submit()}
        okText="Crear Equipo"
        cancelText="Cancelar"
        confirmLoading={guardando}
      >
        <Form form={form} layout="vertical" onFinish={guardar}>
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[
              { required: true, whitespace: true, message: 'Escribe el nombre' },
              { min: 4, message: 'El nombre debe tener al menos 4 caracteres' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="modelo"
            label="Modelo"
            rules={[
              { required: true, whitespace: true, message: 'Escribe el modelo' },
              { min: 2, message: 'El modelo debe tener al menos 2 caracteres' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="anio"
            label="Año"
            rules={[
              { type: 'integer', message: 'El año debe ser un número entero' },
              { type: 'number', min: 1980, message: 'El año debe ser desde 1980 en adelante' },
              { type: 'number', max: anioActual, message: 'El año no puede estar en el futuro' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={1980} max={anioActual} step={1} />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: 'Elige un tipo' }]}
          >
            <Select placeholder="Elige un tipo" options={opcionesTipo} />
          </Form.Item>

          <Form.Item
            name="precioCompra"
            label="Precio de compra (CLP)"
            rules={[
              { required: true, message: 'Escribe el precio' },
              { type: 'integer', message: 'El precio debe ser un número entero' },
              { type: 'number', min: 0, message: 'El precio no puede ser negativo' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={1} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EquipoModal;