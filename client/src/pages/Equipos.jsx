import React, { useState } from 'react';
import { Button, Input, Modal, Select, Table } from 'antd';
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
  gap: '10px',
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

const etiquetasTipo = {
  CAMARA: 'Cámara',
  TRIPODE: 'Trípode',
  MICROFONO: 'Micrófono',
  PANEL_SONIDO: 'Panel de sonido',
  CABLE: 'Cable',
  PANEL_SWITCH: 'Panel switch',
  OTRO: 'Otro',
};

function Equipos() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const equiposFiltrados = equipos.filter((equipo) => {
    const coincideNombre = equipo.nombre
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());

    const coincideTipo = !filtroTipo || equipo.tipo === filtroTipo;

    return coincideNombre && coincideTipo;
  });

  const columnas = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Modelo',
      dataIndex: 'modelo',
      key: 'modelo',
    },
    {
      title: 'Año',
      dataIndex: 'anio',
      key: 'anio',
      render: (anio) => anio ?? '—',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo) => etiquetasTipo[tipo] ?? tipo,
    },
    {
      title: 'Precio CLP',
      dataIndex: 'precioCompra',
      key: 'precioCompra',
      render: (precio) => `$${precio.toLocaleString('es-CL')}`,
    },
  ];

  function guardarEquipo(event) {
    event.preventDefault();

    const formulario = event.currentTarget;
    const datos = Object.fromEntries(new FormData(formulario));

    const equipo = {
      ...datos,
      anio: datos.anio ? Number(datos.anio) : null,
      precioCompra: Number(datos.precioCompra),
      key: crypto.randomUUID(),
    };

    // Estado temporal del frontend; más adelante se conectará con la API.
    setEquipos((actuales) => [...actuales, equipo]);

    formulario.reset();
    setModalAbierto(false);
  }

  return (
    <div className="p-2">
      <PageHeader
        title="Equipos"
        description="Gestiona los equipos del inventario."
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          onClick={() => setModalAbierto(true)}
        >
          Nuevo Equipo
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 12, margin: '20px 0' }}>
        <Input
          placeholder="Filtrar por nombre"
          value={filtroNombre}
          onChange={(event) => setFiltroNombre(event.target.value)}
          style={{ maxWidth: 280 }}
        />

        <Select
          allowClear
          placeholder="Filtrar por tipo"
          value={filtroTipo || undefined}
          onChange={(tipo) => setFiltroTipo(tipo || '')}
          style={{ width: 220 }}
          options={Object.entries(etiquetasTipo).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>

      <Table
        columns={columnas}
        dataSource={equiposFiltrados}
        rowKey="key"
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: 'Aún no hay equipos creados' }}
      />

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
            <Button type="primary" htmlType="submit">
              Crear Equipo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Equipos;