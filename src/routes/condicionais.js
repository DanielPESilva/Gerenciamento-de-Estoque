import { Router } from 'express';
import CondicionaisController from '../controllers/condicionaisController.js';

const router = Router();

// Listar condicionais
router.get('/', CondicionaisController.listarCondicionais);

// Obter estatísticas
router.get('/estatisticas', CondicionaisController.obterEstatisticas);

// Relatórios
router.get('/relatorios/ativos', CondicionaisController.obterRelatorioAtivos);
router.get('/relatorios/devolvidos', CondicionaisController.obterRelatorioDevolvidos);

// Buscar por ID
router.get('/:id', CondicionaisController.buscarCondicionalPorId);

// Criar condicional
router.post('/', CondicionaisController.criarCondicional);

// Atualizar condicional
router.put('/:id', CondicionaisController.atualizarCondicional);

// Devolver item específico
router.post('/:id/devolver-item', CondicionaisController.devolverItem);

// Finalizar condicional
router.post('/:id/finalizar', CondicionaisController.finalizarCondicional);

// Converter em venda
router.post('/:id/converter-venda', CondicionaisController.converterEmVenda);

// Atualizar status de itens
router.patch('/itens/status', CondicionaisController.atualizarStatusItens);

// Deletar condicional
router.delete('/:id', CondicionaisController.deletarCondicional);

export default router;