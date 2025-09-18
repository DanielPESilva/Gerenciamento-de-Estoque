import express from 'express';
import { getAll, getById, create, patch } from '../controllers/usuariosController.js';
import { wrapException } from '../utils/wrapException.js';

const router = express.Router();

// GET /api/usuarios
router.get('/', wrapException(getAll));

// GET /api/usuarios/:id
router.get('/:id', wrapException(getById));

// POST /api/usuarios
router.post('/', wrapException(create));

// PATCH /api/usuarios/:id
router.patch('/:id', wrapException(patch));

export default router;
