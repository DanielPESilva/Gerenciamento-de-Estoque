import commonResponses from '../utils/commonResponses.js';

const vendasRouter = {
  '/api/vendas': {
    get: {
      tags: ['Vendas'],
      summary: 'Listar todas as vendas',
      description: 'Retorna uma lista paginada de todas as vendas com filtros opcionais',
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Número da página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
            example: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Número de vendas por página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            example: 10
          }
        },
        {
          name: 'data_inicio',
          in: 'query',
          description: 'Data inicial para filtro (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            example: '2025-09-01'
          }
        },
        {
          name: 'data_fim',
          in: 'query',
          description: 'Data final para filtro (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            pattern: '^\\d{4}-\\d{2}-\\d{2}$',
            example: '2025-09-30'
          }
        },
        {
          name: 'forma_pgto',
          in: 'query',
          description: 'Filtrar por forma de pagamento',
          required: false,
          schema: {
            type: 'string',
            enum: ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Cheque', 'Permuta'],
            example: 'Cartão de Crédito'
          }
        },
        {
          name: 'valor_min',
          in: 'query',
          description: 'Valor mínimo para filtro',
          required: false,
          schema: {
            type: 'number',
            minimum: 0,
            example: 50.00
          }
        },
        {
          name: 'valor_max',
          in: 'query',
          description: 'Valor máximo para filtro',
          required: false,
          schema: {
            type: 'number',
            minimum: 0,
            example: 200.00
          }
        }
      ],
      responses: {
        '200': commonResponses.SuccessWithPagination200,
        '400': commonResponses.BadRequest400,
        '500': commonResponses.InternalServerError500
      }
    },
    post: {
      tags: ['Vendas'],
      summary: 'Criar nova venda (Sistema Híbrido)',
      description: `
        Cria uma nova venda no sistema com funcionalidades avançadas:
        
        **🔥 Sistema Híbrido:** Aceita items por ID ou nome
        **👤 Cliente Opcional:** Nome e telefone opcionais
        **🔄 Permuta:** Suporte a trocas diretas
        **📦 Estoque Automático:** Subtração automática do estoque
        **💰 Múltiplas Formas:** Pix, Dinheiro, Cartão, Permuta
      `,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateVendaRequest'
            },
            examples: {
              vendaPorNome: {
                summary: '🔥 Venda por Nome + Cliente',
                value: {
                  forma_pgto: 'Cartão de Crédito',
                  valor_total: 71.98,
                  valor_pago: 71.98,
                  desconto: 0,
                  nome_cliente: 'Maria Silva',
                  telefone_cliente: '(11) 99999-8888',
                  itens: [
                    {
                      nome_item: 'Camiseta Básica',
                      quantidade: 2
                    }
                  ]
                }
              },
              vendaPorId: {
                summary: '⚡ Venda por ID (Rápida)',
                value: {
                  forma_pgto: 'Pix',
                  valor_total: 180.00,
                  valor_pago: 180.00,
                  desconto: 0,
                  itens: [
                    {
                      roupas_id: 15,
                      quantidade: 1
                    }
                  ]
                }
              },
              vendaMista: {
                summary: '🎯 Venda Mista (ID + Nome)',
                value: {
                  forma_pgto: 'Dinheiro',
                  valor_total: 215.98,
                  valor_pago: 200.00,
                  desconto: 15.98,
                  nome_cliente: 'João Santos',
                  telefone_cliente: '(11) 88888-7777',
                  itens: [
                    {
                      roupas_id: 15,
                      quantidade: 1
                    },
                    {
                      nome_item: 'Camiseta Básica',
                      quantidade: 1
                    }
                  ]
                }
              },
              permuta: {
                summary: '🔄 Venda por Permuta',
                value: {
                  forma_pgto: 'Permuta',
                  valor_total: 0,
                  valor_pago: 0,
                  desconto: 0,
                  descricao_permuta: 'Troca por 2 blusas femininas tamanho P em bom estado',
                  nome_cliente: 'Ana Costa',
                  telefone_cliente: '(11) 77777-9999',
                  itens: [
                    {
                      nome_item: 'Jaqueta Jeans',
                      quantidade: 1
                    }
                  ]
                }
              },
              vendaAnonima: {
                summary: '👤 Venda Anônima (Sem Cliente)',
                value: {
                  forma_pgto: 'Cartão de Débito',
                  valor_total: 89.90,
                  valor_pago: 89.90,
                  desconto: 0,
                  itens: [
                    {
                      nome_item: 'Calça Jeans',
                      quantidade: 1
                    }
                  ]
                }
              }
            }
          }
        }
      },
      responses: {
        '201': commonResponses.Created201,
        '400': commonResponses.BadRequest400,
        '422': commonResponses.UnprocessableEntity422,
        '500': commonResponses.InternalServerError500
      }
    }
  },

  '/api/vendas/{id}': {
    get: {
      tags: ['Vendas'],
      summary: 'Buscar venda por ID',
      description: 'Retorna os detalhes completos de uma venda específica, incluindo itens e informações do cliente',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID da venda',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      responses: {
        '200': commonResponses.Success200,
        '400': commonResponses.BadRequest400,
        '404': commonResponses.NotFound404,
        '500': commonResponses.InternalServerError500
      }
    },
    put: {
      tags: ['Vendas'],
      summary: 'Atualizar venda',
      description: 'Atualiza os dados de uma venda existente (não altera os itens, apenas dados da venda)',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID da venda',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateVendaRequest'
            },
            example: {
              forma_pgto: 'Pix',
              valor_pago: 110.00,
              nome_cliente: 'Maria Santos Silva',
              telefone_cliente: '(11) 99999-0000'
            }
          }
        }
      },
      responses: {
        '200': commonResponses.Success200,
        '400': commonResponses.BadRequest400,
        '404': commonResponses.NotFound404,
        '500': commonResponses.InternalServerError500
      }
    },
    delete: {
      tags: ['Vendas'],
      summary: 'Deletar venda',
      description: 'Remove uma venda do sistema e reverte o estoque dos itens',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID da venda',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      responses: {
        '200': {
          description: 'Venda deletada e estoque revertido com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Venda deletada e estoque revertido com sucesso'
                  }
                }
              }
            }
          }
        },
        '404': commonResponses.NotFound404,
        '500': commonResponses.InternalServerError500
      }
    }
  }
};

export default vendasRouter;