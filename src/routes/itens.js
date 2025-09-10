import express from 'express';
import ItensController from '../controllers/itensController.js';
import { wrapException } from '../utils/wrapException.js';

const router = express.Router();

// GET /api/itens
router.get('/', wrapException(ItensController.getAll));

// GET /api/itens/:id
router.get('/:id', wrapException(ItensController.getById));

// POST /api/itens
router.post('/', wrapException(ItensController.create));

// PUT /api/itens/:id
router.put('/:id', wrapException(ItensController.update));

// DELETE /api/itens/:id
router.delete('/:id', wrapException(ItensController.delete));

export default router;
