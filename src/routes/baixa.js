import { Router } from 'express';
import BaixaController from '../controllers/baixaController.js';

const router = Router();

// Baixas CRUD
router.get('/', BaixaController.listarBaixas);                      // Listar baixas com filtros
router.get('/estatisticas', BaixaController.obterEstatisticas);     // Estatísticas de baixas
router.get('/relatorio', BaixaController.gerarRelatorio);           // Relatório por período
router.get('/motivos', BaixaController.obterMotivos);               // Listar motivos disponíveis
router.get('/:id', BaixaController.buscarBaixa);                    // Buscar baixa específica
router.post('/', BaixaController.criarBaixa);                       // Criar nova baixa
router.patch('/:id', BaixaController.atualizarBaixa);              // Atualizar baixa
router.delete('/:id', BaixaController.deletarBaixa);               // Deletar baixa (restaura estoque)

// Gerenciamento de itens
router.post('/:id/itens', BaixaController.adicionarItem);           // Adicionar item à baixa
router.get('/:id/itens', BaixaController.listarItens);              // Listar itens da baixa
router.patch('/:id/itens/:item_id', BaixaController.atualizarItem); // Atualizar item específico
router.delete('/:id/itens/:item_id', BaixaController.removerItem);  // Remover item da baixa (restaura estoque)

export default router;