import express from 'express';
import { getAll, getById, create, update, remove } from '../controllers/clientesController.js';

const router = express.Router();

// GET /api/clientes
router.get('/', getAll);

// GET /api/clientes/:id
router.get('/:id', getById);

// POST /api/clientes
router.post('/', create);

// PATCH /api/clientes/:id
router.patch('/:id', update);

// DELETE /api/clientes/:id
router.delete('/:id', remove);

export default router;
