import React, { useEffect, useMemo, useState } from 'react';
import { Form, Input, Modal, Select, message } from 'antd';
import { crearKit, modificarKit } from '../../services/kits.api';

const etiquetasTipo = {
  CAMARA: 'Cámara',
  TRIPODE: 'Trípode',
  MICROFONO: 'Micrófono',
  PANEL_SONIDO: 'Panel de sonido',
  CABLE: 'Cable',
  PANEL_SWITCH: 'Panel switch',
  OTRO: 'Otros (opcional)',
};

const tiposRequeridos = [
  'CAMARA',
  'TRIPODE',
  'MICROFONO',
  'PANEL_SONIDO',
  'CABLE',
  'PANEL_SWITCH',
];

const KitModal = ({ abierto, kit, equipos, onCerrar, onGuardado }) => {
  const [form] = Form.useForm();
  const [mensaje, contextoMensaje] = message.useMessage();
  const [guardando, setGuardando] = useState(false);
  const editando = Boolean(kit);

  const equiposElegibles = useMemo(
    () =>
      equipos.filter(
        (equipo) =>
          equipo.estado === 'BUENO' &&
          equipo.archivadoAt === null &&
          (!equipo.kitId || equipo.kitId === kit?.id),
      ),
    [equipos, kit],
  );

  const opcionesPorTipo = Object.fromEntries(
    Object.keys(etiquetasTipo).map((tipo) => [
      tipo,
      equiposElegibles
        .filter((equipo) => equipo.tipo === tipo)
        .map((equipo) => ({
          value: equipo.id,
          label: `${equipo.nombre} · ${equipo.modelo}`,
        })),
    ]),
  );

  useEffect(() => {
    if (!abierto) return;

    form.resetFields();
    const equiposIniciales = Object.fromEntries(
      Object.keys(etiquetasTipo).map((tipo) => [tipo, []]),
    );

    kit?.equipos?.forEach((equipo) => {
      if (
        equipo.estado === 'BUENO' &&
        equipo.archivadoAt === null &&
        equiposIniciales[equipo.tipo]
      ) {
        equiposIniciales[equipo.tipo].push(equipo.id);
      }
    });

    form.setFieldsValue({
      nombre: kit?.nombre ?? '',
      descripcion: kit?.descripcion ?? '',
      equipos: equiposIniciales,
    });
  }, [abierto, form, kit]);

  const cerrar = () => {
    if (guardando) return;
    form.resetFields();
    onCerrar();
  };

  const guardar = async (valores) => {
    const datos = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion?.trim() || null,
      equipoIds: Object.values(valores.equipos ?? {}).flat(),
    };

    setGuardando(true);

    try {
      if (kit) {
        await modificarKit(kit.id, datos);
        mensaje.success('Kit actualizado.');
      } else {
        await crearKit(datos);
        mensaje.success('Kit creado.');
      }

      form.resetFields();
      onCerrar();
      await onGuardado();
    } catch (error) {
      mensaje.error(
        error.message || (editando ? 'No se pudo actualizar el kit.' : 'No se pudo crear el kit.'),
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      {contextoMensaje}

      <Modal
        centered
        title={editando ? 'Editar kit' : 'Nuevo kit'}
        open={abierto}
        onCancel={cerrar}
        onOk={() => form.submit()}
        okText={editando ? 'Guardar cambios' : 'Crear kit'}
        cancelText="Cancelar"
        confirmLoading={guardando}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={guardar}>
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[
              { required: true, whitespace: true, message: 'Escribe el nombre del kit.' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea rows={3} />
          </Form.Item>

          {tiposRequeridos.map((tipo) => (
            <Form.Item
              key={tipo}
              name={['equipos', tipo]}
              label={etiquetasTipo[tipo]}
              rules={[
                {
                  required: true,
                  type: 'array',
                  min: 1,
                  message: `Selecciona al menos un equipo de tipo ${etiquetasTipo[tipo].toLowerCase()}.`,
                },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                maxTagCount="responsive"
                placeholder={`Selecciona ${etiquetasTipo[tipo].toLowerCase()}`}
                notFoundContent="No hay equipos disponibles de este tipo"
                options={opcionesPorTipo[tipo]}
              />
            </Form.Item>
          ))}

          <Form.Item name={['equipos', 'OTRO']} label={etiquetasTipo.OTRO}>
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              maxTagCount="responsive"
              placeholder="Selecciona otros equipos (opcional)"
              notFoundContent="No hay otros equipos disponibles"
              options={opcionesPorTipo.OTRO}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default KitModal;