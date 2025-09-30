export default {
  CompraCreate: {
    type: "object",
    required: ["forma_pgto", "valor_pago", "itens"],
    properties: {
      forma_pgto: {
        type: "string",
        enum: ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Transferência"],
        description: "Forma de pagamento utilizada na compra"
      },
      valor_pago: {
        type: "number",
        minimum: 0,
        description: "Valor total pago pela compra",
        example: 350.00
      },
      fornecendor: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        description: "Nome do fornecedor",
        example: "Fornecedor ABC Ltda"
      },
      telefone_forncedor: {
        type: "string",
        minLength: 10,
        maxLength: 20,
        description: "Telefone do fornecedor",
        example: "(11) 98765-4321"
      },
      itens: {
        type: "array",
        minItems: 1,
        description: "Lista de itens da compra",
        items: {
          type: "object",
          required: ["quantidade", "valor_peca"],
          properties: {
            roupas_id: {
              type: "integer",
              minimum: 1,
              description: "ID do item existente no sistema (usar OU nome_item)"
            },
            nome_item: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Nome do item para buscar no sistema (usar OU roupas_id)"
            },
            quantidade: {
              type: "integer",
              minimum: 1,
              description: "Quantidade comprada do item",
              example: 5
            },
            valor_peca: {
              type: "number",
              minimum: 0,
              description: "Valor unitário pago por cada peça",
              example: 30.00
            }
          },
          oneOf: [
            { required: ["roupas_id"] },
            { required: ["nome_item"] }
          ]
        }
      }
    }
  },

  CompraUpdate: {
    type: "object",
    properties: {
      forma_pgto: {
        type: "string",
        enum: ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Transferência"],
        description: "Nova forma de pagamento"
      },
      valor_pago: {
        type: "number",
        minimum: 0,
        description: "Novo valor total pago"
      },
      fornecendor: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        description: "Novo nome do fornecedor"
      },
      telefone_forncedor: {
        type: "string",
        minLength: 10,
        maxLength: 20,
        description: "Novo telefone do fornecedor"
      }
    }
  },

  CompraCompleta: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "ID único da compra",
        example: 1
      },
      data_compra: {
        type: "string",
        format: "date-time",
        description: "Data e hora quando a compra foi registrada",
        example: "2025-09-26T02:15:41.454Z"
      },
      forma_pgto: {
        type: "string",
        description: "Forma de pagamento utilizada",
        example: "Pix"
      },
      valor_pago: {
        type: "number",
        description: "Valor total pago pela compra",
        example: 150.00
      },
      fornecendor: {
        type: "string",
        description: "Nome do fornecedor",
        example: "Fornecedor ABC Ltda"
      },
      telefone_forncedor: {
        type: "string",
        description: "Telefone do fornecedor",
        example: "(11) 98765-4321"
      },
      total_itens: {
        type: "integer",
        description: "Quantidade total de itens na compra",
        example: 5
      },
      valor_total_itens: {
        type: "number",
        description: "Valor total calculado dos itens",
        example: 150.00
      },
      ComprasItens: {
        type: "array",
        description: "Lista bruta dos itens da compra (dados do banco)",
        items: {
          "$ref": "#/components/schemas/CompraItemRaw"
        }
      },
      itens: {
        type: "array",
        description: "Lista formatada dos itens da compra",
        items: {
          "$ref": "#/components/schemas/CompraItem"
        }
      }
    }
  },

  CompraItem: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "ID do item da compra",
        example: 1
      },
      roupa: {
        type: "object",
        description: "Informações do item/roupa",
        properties: {
          id: {
            type: "integer",
            description: "ID do item no sistema",
            example: 1
          },
          nome: {
            type: "string",
            description: "Nome do item",
            example: "Camiseta Azul"
          },
          categoria: {
            type: "string",
            description: "Categoria do item",
            example: "Camiseta"
          },
          marca: {
            type: "string",
            description: "Marca do item",
            example: "Nike"
          },
          estoque_atual: {
            type: "integer",
            description: "Quantidade atual em estoque",
            example: 10
          }
        }
      },
      quantidade: {
        type: "integer",
        description: "Quantidade comprada",
        example: 5
      },
      valor_unitario: {
        type: "number",
        description: "Valor unitário pago",
        example: 30.00
      },
      valor_total: {
        type: "number",
        description: "Valor total do item (quantidade × valor_unitario)",
        example: 150.00
      }
    }
  },

  CompraItemRaw: {
    type: "object",
    description: "Dados brutos do item da compra diretamente do banco de dados",
    properties: {
      id: {
        type: "integer",
        description: "ID do item da compra"
      },
      roupas_id: {
        type: "integer", 
        description: "ID da roupa/item"
      },
      compras_id: {
        type: "integer",
        description: "ID da compra"
      },
      quatidade: {
        type: "integer",
        description: "Quantidade (nome do campo no banco)"
      },
      "valor_peça": {
        type: "number",
        description: "Valor da peça (nome do campo no banco)"
      },
      Roupa: {
        type: "object",
        description: "Dados completos da roupa do banco",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          descricao: { type: "string" },
          tipo: { type: "string" },
          tamanho: { type: "string" },
          cor: { type: "string" },
          preco: { type: "number" },
          quantidade: { type: "integer" },
          usuarios_id: { type: "integer" },
          criado_em: { 
            type: "string", 
            format: "date-time" 
          }
        }
      }
    }
  },

  CompraAdicionarItem: {
    type: "object",
    required: ["quantidade", "valor_peca"],
    properties: {
      roupas_id: {
        type: "integer",
        minimum: 1,
        description: "ID do item existente no sistema (usar OU nome_item)"
      },
      nome_item: {
        type: "string", 
        minLength: 1,
        maxLength: 100,
        description: "Nome do item para buscar no sistema (usar OU roupas_id)"
      },
      quantidade: {
        type: "integer",
        minimum: 1,
        description: "Quantidade a adicionar à compra",
        example: 3
      },
      valor_peca: {
        type: "number",
        minimum: 0,
        description: "Valor unitário da peça",
        example: 25.50
      }
    },
    oneOf: [
      { required: ["roupas_id"] },
      { required: ["nome_item"] }
    ]
  },

  CompraAtualizarItem: {
    type: "object",
    properties: {
      quantidade: {
        type: "integer",
        minimum: 1,
        description: "Nova quantidade do item",
        example: 8
      },
      valor_peca: {
        type: "number",
        minimum: 0,
        description: "Novo valor unitário da peça",
        example: 32.50
      }
    }
  },

  CompraRelatorio: {
    type: "object",
    properties: {
      periodo: {
        type: "object",
        description: "Período do relatório",
        properties: {
          data_inicio: {
            type: "string",
            format: "date",
            example: "2025-01-01"
          },
          data_fim: {
            type: "string",
            format: "date",
            example: "2025-12-31"
          }
        }
      },
      resumo: {
        type: "object",
        description: "Resumo estatístico do período",
        properties: {
          total_compras: {
            type: "integer",
            example: 15
          },
          valor_total_gasto: {
            type: "number",
            example: 2450.00
          },
          valor_medio_compra: {
            type: "number",
            example: 163.33
          },
          total_itens_comprados: {
            type: "integer",
            example: 89
          }
        }
      },
      compras: {
        type: "array",
        description: "Lista detalhada das compras no período",
        items: {
          "$ref": "#/components/schemas/CompraCompleta"
        }
      },
      total_compras: {
        type: "integer",
        description: "Total de compras encontradas",
        example: 15
      }
    }
  },

  CompraFinalizacaoResposta: {
    type: "object",
    description: "Resposta da finalização da compra",
    properties: {
      compra_id: {
        type: "integer",
        description: "ID da compra finalizada",
        example: 1
      },
      data_finalizacao: {
        type: "string",
        format: "date-time",
        description: "Data e hora da finalização",
        example: "2025-09-26T02:15:53.195Z"
      },
      itens_adicionados_estoque: {
        type: "array",
        description: "Lista dos itens que foram adicionados ao estoque",
        items: {
          type: "object",
          properties: {
            roupa_nome: {
              type: "string",
              description: "Nome do item",
              example: "Camiseta Azul"
            },
            quantidade_adicionada: {
              type: "integer",
              description: "Quantidade adicionada ao estoque",
              example: 5
            },
            novo_estoque: {
              type: "integer",
              description: "Nova quantidade total em estoque",
              example: 11
            }
          }
        }
      },
      valor_total: {
        type: "number",
        description: "Valor total da compra finalizada",
        example: 150.00
      }
    }
  }
};