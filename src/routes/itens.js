import express from 'express';
import ItensController from '../controllers/itensController.js';
import { wrapException } from '../utils/wrapException.js';

const router = express.Router();

// GET /api/itens
router.get('/', wrapException(ItensController.getAll));

// GET /api/itens/search - Buscar itens por nome (deve vir antes de /:id)
router.get('/search', wrapException(ItensController.searchByName));

// GET /api/itens/:id
router.get('/:id', wrapException(ItensController.getById));

// POST /api/itens
router.post('/', wrapException(ItensController.create));

// PUT /api/itens/:id
router.put('/:id', wrapException(ItensController.update));

// PATCH /api/itens/:id
router.patch('/:id', wrapException(ItensController.patch));

// DELETE /api/itens/:id
router.delete('/:id', wrapException(ItensController.delete));

// POST /api/itens/:id/add-quantidade - Adicionar quantidade ao estoque
router.post('/:id/add-quantidade', wrapException(ItensController.addQuantidade));

// POST /api/itens/:id/remove-quantidade - Remover quantidade do estoque
router.post('/:id/remove-quantidade', wrapException(ItensController.removeQuantidade));

export default router;
