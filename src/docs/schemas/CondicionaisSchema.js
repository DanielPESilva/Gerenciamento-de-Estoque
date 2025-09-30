/**
 * @swagger
 * components:
 *   schemas:
 *     CondicionalItem:
 *       type: object
 *       properties:
 *         roupas_id:
 *           type: integer
 *           description: ID do item (opcional se nome_item for fornecido)
 *           example: 5
 *         nome_item:
 *           type: string
 *           description: Nome do item (opcional se roupas_id for fornecido)
 *           example: "Vestido Floral"
 *         quantidade:
 *           type: integer
 *           minimum: 1
 *           description: Quantidade do item
 *           example: 2
 *       anyOf:
 *         - required: [roupas_id, quantidade]
 *         - required: [nome_item, quantidade]
 *
 *     CondicionalCreate:
 *       type: object
 *       required:
 *         - cliente_id
 *         - data_devolucao
 *         - itens
 *       properties:
 *         cliente_id:
 *           type: integer
 *           description: ID do cliente
 *           example: 1
 *         data_devolucao:
 *           type: string
 *           format: date
 *           description: Data prevista para devolução (YYYY-MM-DD)
 *           example: "2024-02-15"
 *         itens:
 *           type: array
 *           minItems: 1
 *           description: Lista de itens do condicional
 *           items:
 *             $ref: '#/components/schemas/CondicionalItem'
 *
 *     CondicionalUpdate:
 *       type: object
 *       properties:
 *         cliente_id:
 *           type: integer
 *           description: Novo ID do cliente
 *           example: 2
 *         data_devolucao:
 *           type: string
 *           format: date
 *           description: Nova data de devolução (YYYY-MM-DD)
 *           example: "2024-02-20"
 *       anyOf:
 *         - required: [cliente_id]
 *         - required: [data_devolucao]
 *
 *     CondicionalDevolverItem:
 *       type: object
 *       required:
 *         - roupas_id
 *         - quantidade
 *       properties:
 *         roupas_id:
 *           type: integer
 *           description: ID do item a ser devolvido
 *           example: 5
 *         quantidade:
 *           type: integer
 *           minimum: 1
 *           description: Quantidade a ser devolvida
 *           example: 1
 *
 *     CondicionalFinalizar:
 *       type: object
 *       properties:
 *         observacoes:
 *           type: string
 *           description: Observações sobre a finalização
 *           example: "Todos os itens devolvidos em perfeito estado"
 *
 *     ClienteInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Maria Silva"
 *         email:
 *           type: string
 *           example: "maria@email.com"
 *         telefone:
 *           type: string
 *           example: "(11) 99999-9999"
 *         endereco:
 *           type: string
 *           example: "Rua das Flores, 123 - Centro"
 *
 *     RoupaInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         nome:
 *           type: string
 *           example: "Vestido Floral"
 *         tipo:
 *           type: string
 *           example: "Vestido"
 *         tamanho:
 *           type: string
 *           example: "M"
 *         cor:
 *           type: string
 *           example: "Azul"
 *         preco:
 *           type: number
 *           format: decimal
 *           example: 150.00
 *         quantidade:
 *           type: integer
 *           example: 8
 *
 *     CondicionalItemCompleto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         roupas_id:
 *           type: integer
 *           example: 5
 *         condicionais_id:
 *           type: integer
 *           example: 1
 *         quatidade:
 *           type: integer
 *           description: Quantidade no condicional (note o nome da coluna no banco)
 *           example: 2
 *         Roupa:
 *           $ref: '#/components/schemas/RoupaInfo'
 *
 *     CondicionalCompleto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         cliente_id:
 *           type: integer
 *           example: 1
 *         data:
 *           type: string
 *           format: date-time
 *           description: Data de criação do condicional
 *           example: "2024-01-15T10:30:00.000Z"
 *         data_devolucao:
 *           type: string
 *           format: date-time
 *           description: Data prevista para devolução
 *           example: "2024-02-15T00:00:00.000Z"
 *         devolvido:
 *           type: boolean
 *           description: Status de devolução
 *           example: false
 *         Cliente:
 *           $ref: '#/components/schemas/ClienteInfo'
 *         CondicionaisItens:
 *           type: array
 *           description: Itens do condicional
 *           items:
 *             $ref: '#/components/schemas/CondicionalItemCompleto'
 *
 *     CondicionalEstatisticas:
 *       type: object
 *       properties:
 *         total_condicionais:
 *           type: integer
 *           description: Total de condicionais
 *           example: 150
 *         condicionais_ativos:
 *           type: integer
 *           description: Condicionais ainda não devolvidos
 *           example: 25
 *         condicionais_devolvidos:
 *           type: integer
 *           description: Condicionais já devolvidos
 *           example: 125
 *
 *     ClienteInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string  
 *           example: "Maria Silva"
 *         email:
 *           type: string
 *           example: "maria@email.com"
 *         telefone:
 *           type: string
 *           example: "(11) 99999-9999"
 *
 *     CondicionalItemDetalhado:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         quantidade:
 *           type: integer
 *           example: 2
 *         roupa:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 5
 *             nome:
 *               type: string
 *               example: "Vestido Floral"
 *             tipo:
 *               type: string
 *               example: "vestido"
 *             tamanho:
 *               type: string
 *               example: "M"
 *             cor:
 *               type: string
 *               example: "azul"
 *             preco:
 *               type: number
 *               format: float
 *               example: 89.90
 *             valor_total:
 *               type: number
 *               format: float
 *               example: 179.80
 *               description: "quantidade * preco"
 *
 *     StatusUpdateRequest:
 *       type: object
 *       required:
 *         - roupas_ids
 *         - novo_status
 *       properties:
 *         roupas_ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array com IDs das roupas a serem atualizadas
 *           example: [1, 2, 3]
 *         novo_status:
 *           type: string
 *           enum: [disponivel, em_condicional, vendido]
 *           description: Novo status para os itens
 *           example: "em_condicional"
 */

export default {};