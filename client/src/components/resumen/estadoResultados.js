import { etiquetasTipoGasto } from '../gastos/etiquetasTipoGasto';

const formatoPesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export const formatearPesos = (valor) => (valor < 0 ? '-' : '') + formatoPesos.format(Math.abs(valor));

export const armarEstadoResultados = (resumen) => [
  { tipo: 'seccion', texto: 'Ingresos' },
  { tipo: 'detalle', texto: `Cobro por transmisiones (${resumen.transmisiones.length})`, valor: resumen.ingresos.cobros },
  { tipo: 'detalle', texto: 'Auspicios monetarios', valor: resumen.ingresos.auspicios },
  { tipo: 'subtotal', texto: 'Total ingresos', valor: resumen.ingresos.total },
  { tipo: 'seccion', texto: 'Costos de las transmisiones' },
  { tipo: 'detalle', texto: 'Gastos de transmisión', valor: -resumen.costos.gastosTransmision },
  { tipo: 'detalle', texto: 'Remuneraciones del personal', valor: -resumen.costos.remuneraciones },
  { tipo: 'subtotal', texto: 'Total costos', valor: -resumen.costos.total },
  { tipo: 'resultado', texto: 'Resultado de las transmisiones', valor: resumen.resultadoTransmisiones },
  { tipo: 'seccion', texto: 'Gastos generales' },
  ...resumen.gastosGenerales.detalle.map((gasto) => ({
    tipo: 'detalle',
    texto: etiquetasTipoGasto[gasto.tipo] ?? gasto.tipo,
    valor: -gasto.total,
  })),
  { tipo: 'subtotal', texto: 'Total gastos generales', valor: -resumen.gastosGenerales.total },
  { tipo: 'total', texto: 'Utilidad del mes', valor: resumen.utilidad },
];
