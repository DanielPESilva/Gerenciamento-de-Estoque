import express from 'express';
import ItensController from '../controllers/itensController.js';
import { wrapException } from '../utils/wrapException.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/itens
router.get('/', verifyToken, wrapException(ItensController.getAll));

// GET /api/itens/search - Buscar itens por nome (deve vir antes de /:id)
router.get('/search', verifyToken, wrapException(ItensController.searchByName));

// GET /api/itens/:id
router.get('/:id', verifyToken, wrapException(ItensController.getById));

// POST /api/itens
router.post('/', verifyToken, wrapException(ItensController.create));

// PUT /api/itens/:id
router.put('/:id', verifyToken, wrapException(ItensController.update));

// PATCH /api/itens/:id
router.patch('/:id', verifyToken, wrapException(ItensController.patch));

// DELETE /api/itens/:id
router.delete('/:id', verifyToken, wrapException(ItensController.delete));

// POST /api/itens/:id/add-quantidade - Adicionar quantidade ao estoque
router.post('/:id/add-quantidade', verifyToken, wrapException(ItensController.addQuantidade));

// POST /api/itens/:id/remove-quantidade - Remover quantidade do estoque
router.post('/:id/remove-quantidade', verifyToken, wrapException(ItensController.removeQuantidade));

export default router;
