import express from 'express';
import { getAll, getById, getStats } from '../controllers/vendasController.js';
import { wrapException } from '../utils/wrapException.js';

const router = express.Router();

// GET /api/vendas/stats - deve vir antes de /:id para evitar conflitos
router.get('/stats', wrapException(getStats));

// GET /api/vendas
router.get('/', wrapException(getAll));

// GET /api/vendas/:id
router.get('/:id', wrapException(getById));

export default router;
