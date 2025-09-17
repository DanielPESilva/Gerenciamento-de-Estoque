import express from 'express';
import { getAll, getById, create } from '../controllers/usuariosController.js';
import { wrapException } from '../utils/wrapException.js';

const router = express.Router();

// GET /api/usuarios
router.get('/', wrapException(getAll));

// GET /api/usuarios/:id
router.get('/:id', wrapException(getById));

// POST /api/usuarios
router.post('/', wrapException(create));

export default router;
