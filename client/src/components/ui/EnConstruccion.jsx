
import React from 'react';

function EnConstruccion({ nombreModulo}) {

    const estiloTarjeta = {
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        padding: '24px',
        marginTop: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
    };

    return (
       <div> 

        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Módulo {nombreModulo} — en construcción
        </p>

        <div style={estiloTarjeta}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                Esta pantalla está en construcción, volveremos pronto con más funcionalidades.
            </h2>
            <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
                Mientras tanto, puedes explorar otras secciones de la aplicación.
            </p>
        </div>
       </div> 
    );
}

export default EnConstruccion;