import { Router } from 'express';
import CondicionaisController from '../controller/condicionaisController.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Condicionais
 *   description: Gerenciamento de itens em condicional (empréstimos temporários)
 */

/**
 * @swagger
 * /condicionais:
 *   get:
 *     summary: Listar condicionais
 *     description: Lista todos os condicionais com filtros e paginação
 *     tags: [Condicionais]
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: integer
 *         description: ID do cliente para filtrar
 *       - in: query
 *         name: devolvido
 *         schema:
 *           type: boolean
 *         description: Status de devolução (true/false)
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de condicionais
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Condicionais listados com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CondicionalCompleto'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     hasNext:
 *                       type: boolean
 *                       example: true
 *                     hasPrev:
 *                       type: boolean
 *                       example: false
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', CondicionaisController.listarCondicionais);

/**
 * @swagger
 * /condicionais/estatisticas:
 *   get:
 *     summary: Obter estatísticas de condicionais
 *     description: Retorna estatísticas sobre condicionais (total, ativos, devolvidos)
 *     tags: [Condicionais]
 *     parameters:
 *       - in: query
 *         name: data_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: data_fim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Estatísticas dos condicionais
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estatísticas obtidas com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_condicionais:
 *                       type: integer
 *                       example: 150
 *                     condicionais_ativos:
 *                       type: integer
 *                       example: 25
 *                     condicionais_devolvidos:
 *                       type: integer
 *                       example: 125
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/estatisticas', CondicionaisController.obterEstatisticas);

/**
 * @swagger
 * /condicionais/{id}:
 *   get:
 *     summary: Buscar condicional por ID
 *     description: Retorna um condicional específico com todos os itens e informações do cliente
 *     tags: [Condicionais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do condicional
 *     responses:
 *       200:
 *         description: Condicional encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Condicional encontrado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/CondicionalCompleto'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', CondicionaisController.buscarCondicionalPorId);

/**
 * @swagger
 * /condicionais:
 *   post:
 *     summary: Criar novo condicional
 *     description: Cria um novo condicional com itens especificados por ID ou nome
 *     tags: [Condicionais]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CondicionalCreate'
 *           examples:
 *             por_id:
 *               summary: Seleção de itens por ID
 *               value:
 *                 cliente_id: 1
 *                 data_devolucao: "2024-02-15"
 *                 itens:
 *                   - roupas_id: 5
 *                     quantidade: 2
 *                   - roupas_id: 8
 *                     quantidade: 1
 *             por_nome:
 *               summary: Seleção de itens por nome
 *               value:
 *                 cliente_id: 2
 *                 data_devolucao: "2024-02-20"
 *                 itens:
 *                   - nome_item: "Vestido Floral"
 *                     quantidade: 1
 *                   - nome_item: "Bolsa Preta"
 *                     quantidade: 1
 *             misto:
 *               summary: Seleção mista (ID e nome)
 *               value:
 *                 cliente_id: 3
 *                 data_devolucao: "2024-02-18"
 *                 itens:
 *                   - roupas_id: 10
 *                     quantidade: 1
 *                   - nome_item: "Sapato Social"
 *                     quantidade: 2
 *     responses:
 *       201:
 *         description: Condicional criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Condicional criado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/CondicionalCompleto'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Cliente ou item não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Cliente com ID 999 não encontrado"
 *               code: "CLIENT_NOT_FOUND"
 *       409:
 *         description: Estoque insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Estoque insuficiente para Vestido Azul. Disponível: 1, Solicitado: 3"
 *               code: "INSUFFICIENT_STOCK"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', CondicionaisController.criarCondicional);

/**
 * @swagger
 * /condicionais/{id}:
 *   put:
 *     summary: Atualizar condicional
 *     description: Atualiza informações de um condicional existente (cliente ou data de devolução)
 *     tags: [Condicionais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do condicional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CondicionalUpdate'
 *           examples:
 *             atualizar_cliente:
 *               summary: Alterar cliente
 *               value:
 *                 cliente_id: 5
 *             atualizar_data:
 *               summary: Alterar data de devolução
 *               value:
 *                 data_devolucao: "2024-03-01"
 *             atualizar_ambos:
 *               summary: Alterar cliente e data
 *               value:
 *                 cliente_id: 3
 *                 data_devolucao: "2024-02-25"
 *     responses:
 *       200:
 *         description: Condicional atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Condicional atualizado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/CondicionalCompleto'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', CondicionaisController.atualizarCondicional);

/**
 * @swagger
 * /condicionais/{id}/devolver-item:
 *   post:
 *     summary: Devolver item específico
 *     description: Devolve uma quantidade específica de um item do condicional
 *     tags: [Condicionais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do condicional
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CondicionalDevolverItem'
 *           example:
 *             roupas_id: 5
 *             quantidade: 1
 *     responses:
 *       200:
 *         description: Item devolvido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Item devolvido com sucesso. Quantidade devolvida: 1. Itens restantes no condicional: 2"
 *                 data:
 *                   type: object
 *                   properties:
 *                     quantidadeDevolvida:
 *                       type: integer
 *                       example: 1
 *                     itensRestantes:
 *                       type: integer
 *                       example: 2
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Condicional ou item não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Item não encontrado neste condicional"
 *               code: "ITEM_NOT_IN_CONDICIONAL"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/devolver-item', CondicionaisController.devolverItem);

/**
 * @swagger
 * /condicionais/{id}/finalizar:
 *   post:
 *     summary: Finalizar condicional
 *     description: Finaliza o condicional devolvendo todos os itens restantes ao estoque
 *     tags: [Condicionais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do condicional
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CondicionalFinalizar'
 *           example:
 *             observacoes: "Cliente devolveu todos os itens em perfeito estado"
 *     responses:
 *       200:
 *         description: Condicional finalizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Condicional finalizado com sucesso. Todos os itens foram devolvidos ao estoque"
 *                 data:
 *                   $ref: '#/components/schemas/CondicionalCompleto'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/finalizar', CondicionaisController.finalizarCondicional);

/**
 * @swagger
 * /condicionais/{id}:
 *   delete:
 *     summary: Deletar condicional
 *     description: Deleta um condicional e retorna todos os itens ao estoque
 *     tags: [Condicionais]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do condicional
 *     responses:
 *       200:
 *         description: Condicional deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Condicional deletado com sucesso. Estoque foi restaurado"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', CondicionaisController.deletarCondicional);

export default router;