const vendasSchema = {
  Venda: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
        description: 'ID único da venda'
      },
      data_venda: {
        type: 'string',
        format: 'date-time',
        example: '2025-09-24T10:30:00.000Z',
        description: 'Data e hora da venda'
      },
      forma_pgto: {
        type: 'string',
        enum: ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Cheque', 'Permuta'],
        example: 'Cartão de Crédito',
        description: 'Forma de pagamento'
      },
      valor_total: {
        type: 'number',
        format: 'float',
        example: 115.98,
        description: 'Valor total da venda'
      },
      desconto: {
        type: 'number',
        format: 'float',
        default: 0,
        example: 5.98,
        description: 'Desconto aplicado'
      },
      valor_pago: {
        type: 'number',
        format: 'float',
        example: 110.00,
        description: 'Valor efetivamente pago'
      },
      descricao_permuta: {
        type: 'string',
        nullable: true,
        example: 'Troca por 2 blusas femininas tamanho P',
        description: 'Descrição da permuta (obrigatório quando forma_pgto = Permuta)'
      },
      nome_cliente: {
        type: 'string',
        nullable: true,
        example: 'Maria Silva',
        description: 'Nome do cliente (opcional)'
      },
      telefone_cliente: {
        type: 'string',
        nullable: true,
        example: '(11) 99999-8888',
        description: 'Telefone do cliente (opcional)'
      },
      quantidade_itens: {
        type: 'integer',
        example: 3,
        description: 'Quantidade total de itens na venda'
      },
      itens: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
              description: 'ID do item da venda'
            },
            quantidade: {
              type: 'integer',
              example: 2,
              description: 'Quantidade do item vendido'
            },
            roupa: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 18 },
                nome: { type: 'string', example: 'Camiseta Básica' },
                tipo: { type: 'string', example: 'Camiseta' },
                tamanho: { type: 'string', example: 'M' },
                cor: { type: 'string', example: 'Branco' },
                preco: { type: 'number', example: 35.99 },
                quantidade: { type: 'integer', example: 8 },
                estoque_atualizado: { type: 'integer', example: 8 }
              }
            }
          }
        }
      },
      resumo: {
        type: 'object',
        properties: {
          total_itens_vendidos: { type: 'integer', example: 3 },
          valor_com_desconto: { type: 'number', example: 110.00 },
          diferenca_pagamento: { type: 'number', example: 0 }
        }
      }
    }
  },

  CreateVendaRequest: {
    type: 'object',
    required: ['forma_pgto', 'valor_total', 'valor_pago', 'itens'],
    properties: {
      forma_pgto: {
        type: 'string',
        enum: ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Cheque', 'Permuta'],
        example: 'Cartão de Crédito',
        description: 'Forma de pagamento'
      },
      valor_total: {
        type: 'number',
        format: 'float',
        minimum: 0,
        example: 115.98,
        description: 'Valor total da venda'
      },
      desconto: {
        type: 'number',
        format: 'float',
        minimum: 0,
        default: 0,
        example: 5.98,
        description: 'Desconto aplicado'
      },
      valor_pago: {
        type: 'number',
        format: 'float',
        minimum: 0,
        example: 110.00,
        description: 'Valor efetivamente pago'
      },
      descricao_permuta: {
        type: 'string',
        example: 'Troca por 2 blusas femininas tamanho P',
        description: 'Descrição da permuta (obrigatório quando forma_pgto = Permuta)'
      },
      nome_cliente: {
        type: 'string',
        minLength: 2,
        example: 'Maria Silva',
        description: 'Nome do cliente (opcional, mínimo 2 caracteres)'
      },
      telefone_cliente: {
        type: 'string',
        minLength: 10,
        example: '(11) 99999-8888',
        description: 'Telefone do cliente (opcional, mínimo 10 caracteres)'
      },
      itens: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            roupas_id: {
              type: 'integer',
              minimum: 1,
              example: 18,
              description: 'ID da roupa (usar OU nome_item)'
            },
            nome_item: {
              type: 'string',
              minLength: 1,
              example: 'Camiseta Básica',
              description: 'Nome do item (usar OU roupas_id)'
            },
            quantidade: {
              type: 'integer',
              minimum: 1,
              example: 2,
              description: 'Quantidade do item a ser vendido'
            }
          },
          required: ['quantidade'],
          description: 'Deve informar roupas_id OU nome_item'
        }
      }
    }
  },

  UpdateVendaRequest: {
    type: 'object',
    properties: {
      forma_pgto: {
        type: 'string',
        enum: ['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Cheque', 'Permuta'],
        example: 'Pix',
        description: 'Forma de pagamento'
      },
      valor_total: {
        type: 'number',
        format: 'float',
        minimum: 0,
        example: 120.00,
        description: 'Valor total da venda'
      },
      desconto: {
        type: 'number',
        format: 'float',
        minimum: 0,
        example: 10.00,
        description: 'Desconto aplicado'
      },
      valor_pago: {
        type: 'number',
        format: 'float',
        minimum: 0,
        example: 110.00,
        description: 'Valor efetivamente pago'
      },
      descricao_permuta: {
        type: 'string',
        example: 'Troca atualizada por 3 blusas',
        description: 'Descrição da permuta'
      },
      nome_cliente: {
        type: 'string',
        minLength: 2,
        example: 'Maria Santos',
        description: 'Nome do cliente'
      },
      telefone_cliente: {
        type: 'string',
        minLength: 10,
        example: '(11) 88888-7777',
        description: 'Telefone do cliente'
      }
    }
  }
};

export default vendasSchema;