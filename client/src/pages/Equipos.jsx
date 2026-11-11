import React, { useEffect, useState } from 'react';
import { Alert, Button, Input, Modal, Select, Table } from 'antd';
import PageHeader from '../components/ui/PageHeader';
import { apiFetch } from '../services/api';

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
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [errorFormulario, setErrorFormulario] = useState('');

  useEffect(() => {
    let cancelado = false;

    async function cargarEquipos() {
      try {
        const resultado = await apiFetch('/equipos');
        if (!cancelado) {
          setEquipos(resultado);
        }
      } catch (error) {
        if (!cancelado) {
          setErrorCarga(error.message);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarEquipos();

    return () => {
      cancelado = true;
    };
  }, []);

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
      render: (precio) => `$${Number(precio).toLocaleString('es-CL')}`,
    },
  ];

  async function guardarEquipo(event) {
    event.preventDefault();

    const formulario = event.currentTarget;
    const datos = Object.fromEntries(new FormData(formulario));
    const equipoNuevo = {
      ...datos,
      anio: datos.anio ? Number(datos.anio) : null,
      precioCompra: Number(datos.precioCompra),
    };

    setGuardando(true);
    setErrorFormulario('');

    try {
      const equipoCreado = await apiFetch('/equipos', {
        method: 'POST',
        body: JSON.stringify(equipoNuevo),
      });

      setEquipos((actuales) => [equipoCreado, ...actuales]);
      setFiltroNombre('');
      setFiltroTipo('');
      formulario.reset();
      setModalAbierto(false);
    } catch (error) {
      setErrorFormulario(error.message);
    } finally {
      setGuardando(false);
    }
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
        <Button type="primary" onClick={() => setModalAbierto(true)}>
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
          onChange={(tipo) => setFiltroTipo(tipo ?? '')}
          style={{ width: 220 }}
          options={Object.entries(etiquetasTipo).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>

      {errorCarga && (
        <Alert
          type="error"
          showIcon
          message="No se pudieron cargar los equipos"
          description={errorCarga}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={columnas}
        dataSource={equiposFiltrados}
        rowKey="id"
        loading={cargando}
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: 'Aún no hay equipos creados' }}
      />

      <Modal
        title="Crear Nuevo Equipo"
        open={modalAbierto}
        onCancel={() => {
          setModalAbierto(false);
          setErrorFormulario('');
        }}
        footer={null}
        width={500}
        destroyOnClose
      >
        <form onSubmit={guardarEquipo} style={estiloTarjeta}>
          {errorFormulario && (
            <Alert
              type="error"
              showIcon
              message={errorFormulario}
              style={{ marginBottom: 16 }}
            />
          )}

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
                    min="1980"
                    max={new Date().getFullYear()}
                    step="1"
                    style={estiloInput}
              />
            </label>

            <label style={estiloCampo}>
              Tipo
              <select name="tipo" defaultValue="" required style={estiloInput}>
                <option value="" disabled>
                  Seleccione un tipo
                </option>
                {Object.entries(etiquetasTipo).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
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
            <Button type="primary" htmlType="submit" loading={guardando}>
              Crear Equipo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Equipos;