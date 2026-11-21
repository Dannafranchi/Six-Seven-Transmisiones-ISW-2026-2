import React, { useState } from 'react';
import { Button, InputNumber, Modal, Popconfirm, Select, Space } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import {
  cambiarEstadoEquipo,
  cerrarReparacionEquipo,
  eliminarEquipo,
  iniciarReparacionEquipo,
} from '../../services/equipos.api';

const EquipoAcciones = ({
  equipo,
  etiquetasEstado,
  opcionesEstado,
  mensaje,
  onEditar,
  onGuardado,
}) => {
  const [modalEstadoAbierto, setModalEstadoAbierto] = useState(false);
  const [estadoElegido, setEstadoElegido] = useState(null);
  const [costoReparacion, setCostoReparacion] = useState(null);
  const [guardandoCambioEstado, setGuardandoCambioEstado] = useState(false);

  const requiereCostoReparacion =
    equipo.estado === 'EN_REPARACION' &&
    estadoElegido !== null &&
    estadoElegido !== 'EN_REPARACION';

  const costoIngresado =
    costoReparacion !== null && costoReparacion !== undefined;

  const puedeConfirmarCambio = Boolean(
    estadoElegido &&
      estadoElegido !== equipo.estado &&
      (!requiereCostoReparacion || costoIngresado),
  );

  const abrirModalEstado = () => {
    setEstadoElegido(null);
    setCostoReparacion(null);
    setModalEstadoAbierto(true);
  };

  const cerrarModalEstado = () => {
    if (guardandoCambioEstado) return;

    setModalEstadoAbierto(false);
    setEstadoElegido(null);
    setCostoReparacion(null);
  };

  const darDeBaja = async () => {
    try {
      await eliminarEquipo(equipo.id);
      mensaje.success('Equipo dado de baja.');
      await onGuardado();
    } catch (error) {
      mensaje.error(error.message || 'No se pudo dar de baja el equipo.');
    }
  };

  const confirmarCambioEstado = async () => {
    if (!puedeConfirmarCambio) return;

    setGuardandoCambioEstado(true);

    try {
      let resultado;

      if (estadoElegido === 'EN_REPARACION') {
        resultado = await iniciarReparacionEquipo(equipo.id);
      } else if (equipo.estado === 'EN_REPARACION') {
        resultado = await cerrarReparacionEquipo(equipo.id, {
          costo: Number(costoReparacion),
          estadoFinal: estadoElegido,
        });
      } else {
        resultado = await cambiarEstadoEquipo(equipo.id, estadoElegido);
      }

      if (resultado?.kitDesvinculado) {
        mensaje.warning(
          `${equipo.nombre} fue retirado del kit "${resultado.kitDesvinculado.nombre}" porque dejó de estar disponible. Revisa si el kit necesita un reemplazo.`,
          6,
        );
      } else {
        mensaje.success('Estado del equipo actualizado.');
      }

      setModalEstadoAbierto(false);
      setEstadoElegido(null);
      setCostoReparacion(null);
      await onGuardado();
    } catch (error) {
      mensaje.error(error.message || 'No se pudo cambiar el estado.');
    } finally {
      setGuardandoCambioEstado(false);
    }
  };

  const preguntaCambioEstado = estadoElegido
    ? `¿Estás seguro de cambiar el estado de ${etiquetasEstado[equipo.estado]} a ${etiquetasEstado[estadoElegido]}?`
    : 'Selecciona el nuevo estado del equipo.';

  return (
    <>
      <Space size={4}>
        <Button
          type="text"
          icon={<Pencil size={16} />}
          aria-label="Editar equipo"
          onClick={onEditar}
        />
        <Popconfirm
          title="¿Dar de baja este equipo?"
          description="El equipo dejará de aparecer en el inventario."
          okText="Dar de baja"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
          onConfirm={darDeBaja}
        >
          <Button
            type="text"
            danger
            icon={<Trash2 size={16} />}
            aria-label="Eliminar equipo"
          />
        </Popconfirm>
        <Button type="link" onClick={abrirModalEstado}>
          Cambiar estado
        </Button>
      </Space>

      <Modal
        centered
        title={`Cambiar estado de ${equipo.nombre}`}
        open={modalEstadoAbierto}
        onCancel={cerrarModalEstado}
        width={520}
        footer={[
          <Button
            key="cancelar"
            disabled={guardandoCambioEstado}
            onClick={cerrarModalEstado}
          >
            Cancelar
          </Button>,
          <Button
            key="confirmar"
            type="primary"
            loading={guardandoCambioEstado}
            disabled={!puedeConfirmarCambio}
            onClick={confirmarCambioEstado}
          >
            Confirmar cambio
          </Button>,
        ]}
      >
        <p>{preguntaCambioEstado}</p>

        <Select
          style={{ width: '100%' }}
          placeholder="Selecciona un estado"
          value={estadoElegido ?? undefined}
          options={opcionesEstado.map((opcion) => ({
            ...opcion,
            disabled: opcion.value === equipo.estado,
          }))}
          onChange={(estado) => {
            setEstadoElegido(estado);
            setCostoReparacion(null);
          }}
        />

        {requiereCostoReparacion && (
          <div style={{ marginTop: 16 }}>
            <p>Ingresa cuánto costó la reparación:</p>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={1}
              precision={0}
              value={costoReparacion}
              onChange={setCostoReparacion}
              placeholder="Costo de reparación"
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default EquipoAcciones;
