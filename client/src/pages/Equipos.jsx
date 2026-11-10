import React, { useState } from 'react';
import { Modal } from 'antd';
import PageHeader from '../components/ui/PageHeader';

const estiloTarjeta = {
  backgroundColor: '#ffffff',
  border: '1px solid #080000',
  borderRadius: '10px',
  padding: '30px',
  marginTop: '30px',
  boxShadow: '0 4px 8px rgba(173, 218, 13, 0.05)',
};

const estiloFormulario = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '10px 10px',
};

const estiloCampo = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  fontSize: 15,
};

const estiloInput = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 12px',
};

function Equipos() {
  const [modalAbierto, setModalAbierto] = useState(false);

  function guardarEquipo(event) {
    event.preventDefault();

    const datos = Object.fromEntries(new FormData(event.target));
    const equipo = {
      ...datos,
      anio: datos.anio ? Number(datos.anio) : null,
      precioCompra: Number(datos.precioCompra),
    };

    console.log(equipo);
  }

  return (
    <div className="p-2">
      <PageHeader
        title="Equipos"
        description="Gestiona los equipos del inventario."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          style={{
            backgroundColor: '#ffffff',
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
           Nuevo Equipo
        </button>
      </div>

      <Modal
        title="Crear Nuevo Equipo"
        open={modalAbierto}
        onCancel={() => setModalAbierto(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <form onSubmit={guardarEquipo} style={estiloTarjeta}>
          <div style={estiloFormulario}>
            <label style={{ ...estiloCampo, gridColumn: '1 / -1' }}>
              Nombre
              <input name="nombre" required style={estiloInput} />
            </label>

            <label style={estiloCampo}>
              Modelo
              <input name="modelo" required style={estiloInput} />
            </label>

            <label style={estiloCampo}>
              Año
              <input
                name="anio"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                style={estiloInput}
              />
            </label>

            <label style={estiloCampo}>
              Tipo
              <select name="tipo" defaultValue="" required style={estiloInput}>
                <option value="" disabled>
                  Seleccione un tipo
                </option>
                <option value="CAMARA">Cámara</option>
                <option value="TRIPODE">Trípode</option>
                <option value="MICROFONO">Micrófono</option>
                <option value="PANEL_SONIDO">Panel de sonido</option>
                <option value="CABLE">Cable</option>
                <option value="PANEL_SWITCH">Panel switch</option>
                <option value="OTRO">Otro</option>
              </select>
            </label>

            <label style={estiloCampo}>
              Precio CLP
              <input
                name="precioCompra"
                type="number"
                min="0"
                step="1"
                required
                style={estiloInput}
              />
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 20,
            }}
          >
            <button
              type="submit"
              style={{
                padding: '12px 30px',
                backgroundColor: '#ffffff',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Crear Equipo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Equipos;