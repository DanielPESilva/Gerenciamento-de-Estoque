import express from "express";
import multer from "multer";
import ImagensController from "../controllers/imagensController.js";
import { sendError } from "../utils/messages.js";

const router = express.Router();

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',     // JPEG
    'image/jpg',      // JPG  
    'image/png',      // PNG
    'image/gif',      // GIF
    'image/webp',     // WEBP
    'image/bmp'       // BMP
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Envie apenas imagens: JPEG, JPG, PNG, GIF, WEBP, BMP'));
  }
};

// Configuração do multer para upload de imagens
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB por arquivo
    files: 5 // Máximo 5 arquivos por vez
  },
}).fields([
  { name: 'imagens', maxCount: 5 }
]);

// Middleware para tratar erros do multer
const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, ['Arquivo muito grande. Tamanho máximo: 10MB']);
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return sendError(res, 400, ['Muitos arquivos. Máximo: 5 imagens por vez']);
    }
    if (err.message.includes('Tipo de arquivo não suportado')) {
      return sendError(res, 400, [err.message]);
    }
    return sendError(res, 400, [err.message]);
  }
  next();
};

// Rotas
router.get("/imagens", ImagensController.listar);
router.get('/imagens/:itemId/:filename', ImagensController.buscar_imagem);
router.post('/imagens', upload, handleUploadError, ImagensController.inserir);
router.delete('/imagens/:id', ImagensController.deletar);

export default router;