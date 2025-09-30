import express from 'express';
import { getAll, getById, create, patch, deleteUser, getMe } from '../controllers/usuariosController.js';
import { wrapException } from '../utils/wrapException.js';

const router = express.Router();

// GET /api/usuarios/me - deve vir antes de /:id para evitar conflitos
router.get('/me', wrapException(getMe));

// GET /api/usuarios
router.get('/', wrapException(getAll));

// GET /api/usuarios/:id
router.get('/:id', wrapException(getById));

// POST /api/usuarios
router.post('/', wrapException(create));

// PATCH /api/usuarios/:id
router.patch('/:id', wrapException(patch));

// DELETE /api/usuarios/:id
router.delete('/:id', wrapException(deleteUser));

export default router;
