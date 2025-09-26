import { Router } from 'express';
import ComprasController from '../controller/comprasController.js';

const router = Router();

// Compras CRUD
router.get('/', ComprasController.listarCompras);                    // Listar compras com filtros
router.get('/estatisticas', ComprasController.obterEstatisticas);    // Estatísticas de compras
router.get('/relatorio', ComprasController.gerarRelatorio);          // Relatório por período
router.get('/:id', ComprasController.buscarCompra);                  // Buscar compra específica
router.post('/', ComprasController.criarCompra);                     // Criar nova compra
router.put('/:id', ComprasController.atualizarCompra);              // Atualizar compra
router.delete('/:id', ComprasController.deletarCompra);             // Deletar compra

// Gerenciamento de itens
router.post('/:id/itens', ComprasController.adicionarItem);         // Adicionar item à compra
router.get('/:id/itens', ComprasController.listarItens);            // Listar itens da compra
router.put('/itens/:itemId', ComprasController.atualizarItem);      // Atualizar item específico
router.delete('/itens/:itemId', ComprasController.removerItem);     // Remover item da compra

// Finalização
router.post('/:id/finalizar', ComprasController.finalizarCompra);   // Finalizar compra (adicionar ao estoque)

export default router;