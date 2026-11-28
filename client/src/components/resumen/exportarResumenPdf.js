import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import dayjs from 'dayjs';
import { armarEstadoResultados, formatearPesos } from './estadoResultados';

const MARGEN = 15;
const VERDE = [56, 158, 13];
const ROJO = [207, 19, 34];
const GRIS = [110, 110, 110];

const formatoMes = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });
const formatoFecha = new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC' });

const colorSegunSigno = (valor) => (valor < 0 ? ROJO : VERDE);

const asegurarEspacio = (doc, y, necesario) => {
  if (y + necesario <= doc.internal.pageSize.getHeight() - MARGEN) return y;
  doc.addPage();
  return 20;
};

const escribirTitulo = (doc, texto, y) => {
  const posicion = asegurarEspacio(doc, y, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text(texto, MARGEN, posicion);
  return posicion + 3;
};

const escribirNota = (doc, texto, y) => {
  const posicion = asegurarEspacio(doc, y, 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  doc.text(texto, MARGEN, posicion, { maxWidth: doc.internal.pageSize.getWidth() - 2 * MARGEN });
};

const filaDelEstado = (fila) => {
  if (fila.tipo === 'seccion') {
    return [
      {
        content: fila.texto.toUpperCase(),
        colSpan: 2,
        styles: { fontStyle: 'bold', fontSize: 8, textColor: 110, cellPadding: { top: 4, bottom: 1, left: 2 } },
      },
    ];
  }

  const destacada = fila.tipo === 'resultado' || fila.tipo === 'total';
  const fondo = fila.valor < 0 ? [255, 241, 240] : [246, 255, 237];
  const estilos = {
    fontStyle: fila.tipo === 'detalle' ? 'normal' : 'bold',
    fillColor: destacada ? fondo : false,
  };

  return [
    { content: fila.texto, styles: { ...estilos, cellPadding: { top: 1.5, bottom: 1.5, left: fila.tipo === 'detalle' ? 6 : 2 } } },
    { content: formatearPesos(fila.valor), styles: { ...estilos, halign: 'right', textColor: destacada ? colorSegunSigno(fila.valor) : 30 } },
  ];
};

export function exportarResumenPdf(resumen) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Resumen financiero', MARGEN, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...GRIS);
  doc.text(`Six Seven SpA · ${formatoMes.format(dayjs(resumen.mes).toDate())}`, MARGEN, 27);
  doc.text(`Generado el ${dayjs().format('DD-MM-YYYY')}`, ancho - MARGEN, 27, { align: 'right' });

  autoTable(doc, {
    startY: 34,
    theme: 'grid',
    head: [['Ingresos', 'Costos y gastos', 'Utilidad', 'Margen']],
    body: [
      [
        formatearPesos(resumen.ingresos.total),
        formatearPesos(resumen.costos.total + resumen.gastosGenerales.total),
        { content: formatearPesos(resumen.utilidad), styles: { textColor: colorSegunSigno(resumen.utilidad) } },
        resumen.margen === null
          ? '—'
          : { content: `${resumen.margen.toLocaleString('es-CL')} %`, styles: { textColor: colorSegunSigno(resumen.margen) } },
      ],
    ],
    headStyles: { fillColor: [245, 245, 245], textColor: 80, fontStyle: 'normal', halign: 'center' },
    bodyStyles: { fontSize: 13, fontStyle: 'bold', halign: 'center', cellPadding: 4 },
  });

  let y = escribirTitulo(doc, 'Estado de resultados', doc.lastAutoTable.finalY + 12);

  autoTable(doc, {
    startY: y,
    theme: 'plain',
    tableWidth: 120,
    body: armarEstadoResultados(resumen).map(filaDelEstado),
  });

  y = escribirTitulo(doc, 'Ganancia por transmisión', doc.lastAutoTable.finalY + 12);

  if (resumen.transmisiones.length === 0) {
    escribirNota(doc, 'No hay transmisiones en este mes.', y + 4);
    y += 4;
  } else {
    autoTable(doc, {
      startY: y,
      theme: 'striped',
      head: [['Transmisión', 'Fecha', 'Ingresos', 'Gastos', 'Personal', 'Ganancia']],
      body: resumen.transmisiones.map((transmision) => [
        transmision.nombre,
        formatoFecha.format(new Date(transmision.fecha)),
        formatearPesos(transmision.ingresos),
        formatearPesos(transmision.gastos),
        formatearPesos(transmision.remuneraciones),
        {
          content: formatearPesos(transmision.ganancia),
          styles: { textColor: colorSegunSigno(transmision.ganancia), fontStyle: 'bold' },
        },
      ]),
      foot: [
        [
          'Total',
          '',
          formatearPesos(resumen.ingresos.total),
          formatearPesos(resumen.costos.gastosTransmision),
          formatearPesos(resumen.costos.remuneraciones),
          {
            content: formatearPesos(resumen.resultadoTransmisiones),
            styles: { textColor: colorSegunSigno(resumen.resultadoTransmisiones) },
          },
        ],
      ],
      showFoot: 'lastPage',
      headStyles: { fillColor: [64, 64, 64] },
      footStyles: { fillColor: [235, 235, 235], textColor: 30 },
      didParseCell: (celda) => {
        if (celda.column.index >= 2) celda.cell.styles.halign = 'right';
      },
    });
    y = doc.lastAutoTable.finalY;
  }

  if (resumen.canjes.cantidad > 0) {
    escribirNota(
      doc,
      `Auspicios en canje: ${resumen.canjes.cantidad} (valor estimado ${formatearPesos(resumen.canjes.total)}). No se suman a los ingresos porque no entran como dinero.`,
      y + 8,
    );
  }

  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    doc.text(`Página ${pagina} de ${paginas}`, ancho / 2, alto - 8, { align: 'center' });
  }

  doc.save(`resumen-${resumen.mes}.pdf`);
}
