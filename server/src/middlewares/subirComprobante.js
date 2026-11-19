const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const CARPETA_COMPROBANTES = path.join(__dirname, '../../uploads/comprobantes');

const EXTENSIONES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf',
};

const TAMANO_MAXIMO_MB = 5;

const subida = multer({
  storage: multer.diskStorage({
    destination: CARPETA_COMPROBANTES,
    filename: (req, archivo, cb) => {
      cb(null, `${crypto.randomUUID()}${EXTENSIONES[archivo.mimetype]}`);
    },
  }),
  limits: { fileSize: TAMANO_MAXIMO_MB * 1024 * 1024 },
  fileFilter: (req, archivo, cb) => {
    if (EXTENSIONES[archivo.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('El comprobante debe ser JPG, PNG o PDF'));
    }
  },
}).single('comprobante');

function subirComprobante(req, res, next) {
    subida(req, res, (error) => {
    if (error) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? `El comprobante no puede superar los ${TAMANO_MAXIMO_MB} MB`
          : error.message;
      return res.status(400).json({ message })
    }
    next();
  });
}

module.exports = { subirComprobante, CARPETA_COMPROBANTES };