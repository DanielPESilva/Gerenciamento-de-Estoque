import swaggerHead from './configs/head.js';
import commonResponses from './utils/commonResponses.js';
import itensSchema from './schemas/itensSchema.js';
import usuariosSchema from './schemas/usuariosSchema.js';
import vendasSchema from './schemas/vendasSchema.js';
import condicionaisSchema from './schemas/CondicionaisSchema.js';
import itensRouter from './routes/itensRouter.js';
import usuariosRouter from './routes/usuariosRouter.js';
import vendasRouter from './routes/vendasRouter.js';
import condicionaisRouter from './routes/condicionaisRouter.js';

const swaggerDocument = {
  ...swaggerHead,
  paths: {
    ...itensRouter,
    ...usuariosRouter,
    ...vendasRouter,
    ...condicionaisRouter
  },
  components: {
    schemas: {
      // Schemas de Itens
      Item: itensSchema.Item,
      CreateItemRequest: itensSchema.CreateItemRequest,
      UpdateItemRequest: itensSchema.UpdateItemRequest,
      QuantityRequest: itensSchema.QuantityRequest,
      SearchRequest: itensSchema.SearchRequest,
      
      // Schemas de Usuários
      Usuario: usuariosSchema.Usuario,
      CreateUsuarioRequest: usuariosSchema.CreateUsuarioRequest,
      UpdateUsuarioRequest: usuariosSchema.UpdateUsuarioRequest,
      
      // Schemas de Vendas
      Venda: vendasSchema.Venda,
      CreateVendaRequest: vendasSchema.CreateVendaRequest,
      UpdateVendaRequest: vendasSchema.UpdateVendaRequest,
      
      // Schemas de Condicionais
      CondicionalItem: {
        type: "object",
        properties: {
          roupas_id: {
            type: "integer",
            description: "ID do item (opcional se nome_item for fornecido)",
            example: 5
          },
          nome_item: {
            type: "string", 
            description: "Nome do item (opcional se roupas_id for fornecido)",
            example: "Vestido Floral"
          },
          quantidade: {
            type: "integer",
            minimum: 1,
            description: "Quantidade do item",
            example: 2
          }
        }
      },
      CondicionalCreate: {
        type: "object",
        required: ["cliente_id", "data_devolucao", "itens"],
        properties: {
          cliente_id: {
            type: "integer",
            description: "ID do cliente",
            example: 1
          },
          data_devolucao: {
            type: "string",
            format: "date-time",
            description: "Data prevista para devolução",
            example: "2025-12-15T23:59:59.000Z"
          },
          itens: {
            type: "array",
            minItems: 1,
            description: "Lista de itens do condicional",
            items: {
              "$ref": "#/components/schemas/CondicionalItem"
            }
          }
        }
      },
      CondicionalUpdate: {
        type: "object",
        properties: {
          cliente_id: {
            type: "integer",
            description: "Novo ID do cliente",
            example: 2
          },
          data_devolucao: {
            type: "string",
            format: "date-time", 
            description: "Nova data de devolução",
            example: "2025-12-20T23:59:59.000Z"
          }
        }
      },
      CondicionalDevolverItem: {
        type: "object",
        required: ["roupas_id", "quantidade"],
        properties: {
          roupas_id: {
            type: "integer",
            description: "ID do item a ser devolvido",
            example: 5
          },
          quantidade: {
            type: "integer",
            minimum: 1,
            description: "Quantidade a ser devolvida",
            example: 1
          }
        }
      },
      CondicionalFinalizar: {
        type: "object",
        properties: {
          observacoes: {
            type: "string",
            description: "Observações sobre a finalização",
            example: "Todos os itens devolvidos em perfeito estado"
          }
        }
      },
      CondicionalConverterVenda: {
        type: "object",
        required: ["itens_vendidos", "forma_pagamento"],
        properties: {
          itens_vendidos: {
            oneOf: [
              {
                type: "string",
                enum: ["todos"],
                description: "Vender todos os itens do condicional"
              },
              {
                type: "array",
                minItems: 1,
                description: "Lista específica de itens para venda",
                items: {
                  type: "object",
                  required: ["roupas_id", "quantidade"],
                  properties: {
                    roupas_id: {
                      type: "integer",
                      description: "ID do item a ser vendido",
                      example: 5
                    },
                    quantidade: {
                      type: "integer",
                      minimum: 1,
                      description: "Quantidade a ser vendida",
                      example: 1
                    }
                  }
                }
              }
            ]
          },
          desconto: {
            type: "number",
            minimum: 0,
            description: "Valor do desconto aplicado",
            example: 10.50,
            default: 0
          },
          forma_pagamento: {
            type: "string",
            enum: ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Permuta"],
            description: "Forma de pagamento utilizada",
            example: "Cartão de Crédito"
          },
          observacoes: {
            type: "string",
            description: "Observações sobre a venda",
            example: "Cliente comprou parte dos itens"
          }
        }
      },
      ClienteInfo: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nome: { type: "string", example: "Maria Silva" },
          email: { type: "string", example: "maria@email.com" },
          telefone: { type: "string", example: "(11) 99999-9999" },
          endereco: { type: "string", example: "Rua das Flores, 123 - Centro" }
        }
      },
      RoupaInfo: {
        type: "object", 
        properties: {
          id: { type: "integer", example: 5 },
          nome: { type: "string", example: "Vestido Floral" },
          tipo: { type: "string", example: "Vestido" },
          tamanho: { type: "string", example: "M" },
          cor: { type: "string", example: "Azul" },
          preco: { type: "number", format: "decimal", example: 150.00 },
          quantidade: { type: "integer", example: 8 }
        }
      },
      CondicionalItemCompleto: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          roupas_id: { type: "integer", example: 5 },
          condicionais_id: { type: "integer", example: 1 },
          quatidade: { 
            type: "integer", 
            description: "Quantidade no condicional (note o nome da coluna no banco)",
            example: 2 
          },
          Roupa: { "$ref": "#/components/schemas/RoupaInfo" }
        }
      },
      CondicionalCompleto: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          cliente_id: { type: "integer", example: 1 },
          data: { 
            type: "string", 
            format: "date-time",
            description: "Data de criação do condicional",
            example: "2024-01-15T10:30:00.000Z"
          },
          data_devolucao: {
            type: "string",
            format: "date-time", 
            description: "Data prevista para devolução",
            example: "2024-02-15T00:00:00.000Z"
          },
          devolvido: {
            type: "boolean",
            description: "Status de devolução",
            example: false
          },
          Cliente: { "$ref": "#/components/schemas/ClienteInfo" },
          CondicionaisItens: {
            type: "array",
            description: "Itens do condicional",
            items: { "$ref": "#/components/schemas/CondicionalItemCompleto" }
          }
        }
      },
      CondicionalEstatisticas: {
        type: "object",
        properties: {
          total_condicionais: {
            type: "integer",
            description: "Total de condicionais",
            example: 150
          },
          condicionais_ativos: {
            type: "integer", 
            description: "Condicionais ainda não devolvidos",
            example: 25
          },
          condicionais_devolvidos: {
            type: "integer",
            description: "Condicionais já devolvidos", 
            example: 125
          }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Erro na operação" },
          code: { type: "string", example: "ERROR_CODE" }
        }
      }
    },
    responses: {
      ...commonResponses
    }
  }
};

export default swaggerDocument;